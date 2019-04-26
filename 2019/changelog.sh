#!/bin/sh

# wiki： git-scm.com/docs/pretty-formats

# The script gets the commit information between two different tags, 
# or the commit information between the tag and current branch, 
# and write to the changelog.
# 
# Usage:
# 1. If you want to hit the latest tag `XXX` and the previous tag is `XXX`, 
#    you should run command line like `sh changelog.sh XXX`
#    to get the latest commit information and write to changelog.
# 2. The commit information start with `Merge` or `Revert` will be sign as useless information and remove.
# 3. This script will get each PR's first commit message for log list.
# 4. You can write like `[issue id]` to relative with issue in PR's first commit message.
# 5. In order to improve readability, we should write the submission(at least the first submission) 
#    in the following format: 
#       XXX
#       feat: a new feature
#       fix: a bug fix
#       docs: changes to documentation
#       style: formatting, missing semi colons, etc; no code change
#       refactor: refactoring production code
#       test: adding tests, refactoring test; no production code change
#       chore: updating build tasks, package manager configs, etc; no production code change


##### Constants
# You can customize the following variables for your own project.
# PR_ID
# PR_URL
# PR_COMMIT_URL
# ISSUE_ID
# ISSUE_URL
# FILE_NAME
# issue_name in replace_by_link()

MARK='\033[1;33m[*]\033[0m'
USELESS_LINE='^- (Merge|Revert).*$'
UNVARIABLE_LINE='^@-.*]$'

PR_ID='#[0-9]{1,4}'
PR_URL="http:\/\/XXXX"
PR_COMMIT_URL="http://XXX/"

ISSUE_ID='[a-zA-Z]{4,6}-[0-9]{1,4}'
ISSUE_URL="http:XXXXX/"
REPLACED='^.*[a-zA-z]+:\/\/*'

FILE_NAME=CHANGELOG.md
FILE_SIZE=$(stat -f %z $FILE_NAME)
FILE_TITLE="# CHANGELOG\n\n All notable changes to this project will be documented in this file.\n"

CURRENT_BRANCH=$(git symbolic-ref --short -q HEAD)
TAG_NAME=$1
TAG_NAME_TWO=$2
TAG_DATE=$(git log -1 --pretty=tformat:%cd --date=short)
TAG_NAME_PREV=$(git describe --abbrev=0 --tags)

##### Functions

check_file() {
  if [ ! -f "$FILE_NAME" ]; then
    echo $MARK "The file $FILE_NAME does not exist,creating..."
    echo $FILE_TITLE >> $FILE_NAME
  elif test $FILE_SIZE != 0; then
    echo $MARK "The file $FILE_NAME exists and the size is $FILE_SIZE bytes."
  else
    echo $FILE_TITLE >> $FILE_NAME
  fi
}

echo_tag_infos() {
  if [[ -z "$TAG_NAME" ]]; then
    echo $MARK "Input latest tag name link 'npm run changelog XXX' please, Exit."
    exit 0
  fi

  # If we use command with two params like: npm run changelog XXX
  if [[ $TAG_NAME_TWO ]]; then
    date=$(git log -1 --pretty=tformat:%cd --date=short $TAG_NAME_TWO)
    if [ `grep -c $TAG_NAME_TWO $FILE_NAME` -eq 0 ]; then
      echo $MARK "Acquiring the latest tag $TAG_NAME's commit information from git log..."
    else
      echo $MARK "The latest tag $TAG_NAME_TWO's commit information exists."
      echo $MARK "Exit."
      exit 0
    fi

    # Insert the latest message to the changelog from line 4.
    sed -i '' $'4 s/^$/\\\n'"## $TAG_NAME_TWO \/ $date"$'\\\n\\\n/g' $FILE_NAME
    echo $MARK "Executed."

    # If you want to add commit link to log, use like e.g,format="- %s - [[%h]($PR_COMMIT_URL%h)@%an]%n"
    infos=cat git log $TAG_NAME...$TAG_NAME_TWO --oneline --pretty=format:"- %s [@%an]%n" >> $FILE_NAME.tmp
  else
    # If we use command with only one param like: npm run changelog XXX
    if [ `grep -c $TAG_NAME $FILE_NAME` -eq 0 ]; then
      echo $MARK "Acquiring the latest tag $TAG_NAME's commit information from git log..."
    else
      echo $MARK "The latest tag $TAG_NAME's commit information exists."
      echo $MARK "Exit."
      exit 0
    fi

    sed -i '' $'4 s/^$/\\\n'"## $TAG_NAME \/ $TAG_DATE"$'\\\n\\\n/g' $FILE_NAME
    echo $MARK "Executed."
    infos=cat git log $TAG_NAME_PREV...$CURRENT_BRANCH --oneline --pretty=format:"- %s [@%an]%n" >> $FILE_NAME.tmp
  fi

  row_temp=0
  row=7
  while read line
  do
    let row_temp+=1
    if [[ $(($row_temp%2)) == 0 ]]; then
      continue
    else
      let row-=1
      num=$[$row_temp+$row]
      sed -i '' $"$num"' s|^|'"$line"$'\\\n|g' $FILE_NAME
    fi
  done < $FILE_NAME.tmp
  rm -rf $FILE_NAME.tmp
}

remove_useless_infos() {
  num=0
  while read line
  do
    let num+=1
    if [[ $line =~ $USELESS_LINE ]]; then
      # Sign useless lines(start with `Merge` or `Revert`)
      sed -i '' $num' s/^/@/' $FILE_NAME
    fi
  done < $FILE_NAME

  # Remove useless lines
  sed -i '' "/$UNVARIABLE_LINE/d" $FILE_NAME
}

related_issue_pr() {
  for line in `cat $FILE_NAME`
  do
    # Replace pr id (e.g,#3350 -> [#3350](pr url))
    if [[ $line =~ $REPLACED ]]; then
      continue
    else
      if [[ $line =~ $PR_ID ]]; then
        pr_id=$(echo ${line:1:$((${#line}-2))})
        pr_num=$(echo ${line:2:$((${#line}-3))})
        if [[ $pr_id =~ $PR_ID ]]; then
          sed -i '' "s/(\[$pr_id\]($PR_URL$pr_num))/($pr_id)/" $FILE_NAME
          sed -i '' "s/($pr_id)/(\[$pr_id\]($PR_URL$pr_num))/" $FILE_NAME
        fi
      fi
      # Replace issue id (e.g,WIZARD-3931 -> [WIZARD-3931](issue url))
      if [[ $line =~ $ISSUE_ID ]]; then
        issue_name=$(echo ${line/#*wizard/WIZARD})
        issue_id_left=$(echo ${issue_name/#*[})
        issue_id_left1=$(echo ${issue_id_left/#*\/})
        issue_id=$(echo ${issue_id_left1/%]*})
        sed -i '' "s/\[$issue_id\]($ISSUE_URL$issue_id)/\[$issue_id\]/" $FILE_NAME
        sed -i '' "s/\[$issue_id\]/\[$issue_id\]($ISSUE_URL$issue_id)/" $FILE_NAME
      fi
    fi
  done
}

format_line_style() {
  sed -i '' "s/- *feat:/- Feat:/g" $FILE_NAME
  sed -i '' "s/- *fix:/- Fix:/g" $FILE_NAME
  sed -i '' "s/- *docs:/- Docs:/g" $FILE_NAME
  sed -i '' "s/- *style:/- Style:/g" $FILE_NAME
  sed -i '' "s/- *refactor:/- Refactor:/g" $FILE_NAME
  sed -i '' "s/- *test:/- Test:/g" $FILE_NAME
  sed -i '' "s/- *chore:/- Chore:/g" $FILE_NAME
}

##### Main
check_file
echo_tag_infos
remove_useless_infos
related_issue_pr
format_line_style
