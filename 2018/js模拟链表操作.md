# js模拟链表 #

最近项目有个需求给素材做tag系统，并且是有层级的tag,当移动素材到文件夹里可以返回之前的文件夹。

### 效果图如下

![color-picker-snap](src/moveMediaToFolder.png)

### html页面图如下
![color-picker-snap](src/moveFolderHtml.png)

> 首先根据`modalData`过来的值设置两个数组以及当前的索引值为0
```js
    $scope.next = 0;
    $scope.folderArray = [modalData.folders]; //define a array to store folder info;
    $scope.nameArray = ["Destination_Folder"];//define a array to store folderName info;
```
> 当点击进入文件夹之后根据接口获取到的值添加到文件夹数组 `$scope.folderArray` 和文件名数组 `$scope.nameArray `, 同时没添加一次就给索引值加1
```js
    $scope.folderDetail = function(info){
        $scope.selectFolderId = info.id;
        $scope.name = info.name;
        $scope.next +=1;
        let call = {
            "parent" :info.id
        };
        let getFolder = media.getFolders(call, function(data){
            $scope.folderArray.push(data);
            $scope.nameArray.push(info.name);
            $scope.folders = $scope.folderArray[$scope.folderArray.length-1];
            return data;
        });
    };
```

> 点击返回上一层文件夹，如若不是最顶级的时候点击则返回最顶级，否则的话则删除数组最后一个值，而当前的值则取删除后的最后一个值，同时返回操作和进入操作步骤想对等
```js
    $scope.backFolder = function(){
        if( $scope.next <= 0) {
            let call = {
                "parent" :0
            };
            $scope.folderArray = [];
            $scope.folderId = 0;
            $scope.selectFolderId = null;
            let getFolder = media.getFolders(call, function(data){
                $scope.folderArray.push(data);
                $scope.nameArray = ["Destination_Folder"];
                $scope.name = "Destination_Folder";  
                $scope.folders = $scope.folderArray[$scope.folderArray.length-1];
                return data;
            });
        }else{
            $scope.next -=1;
            $scope.folderArray.splice($scope.folderArray.length-1, 1);
            $scope.nameArray.splice($scope.nameArray.length-1, 1);
            $scope.folders = $scope.folderArray[$scope.folderArray.length-1];
            $scope.name = $scope.nameArray[$scope.nameArray.length-1];
        } 
    };
```


### 具体思路图如下
![color-picker-snap](src/folderBack.png)


### 总结
    当需要下一层进入的时候，数组尾部添加并取最后一个值，返回上一层的话则可以通过取数组索引值来获取需要的值，但是当二次进入下一层的时候再尾部添加会导致
    二次返回上一层的是数组顺序紊乱，所以返回时候清除数组比取最后一个值更佳，当然用链表会比数组更好。
###  如下图所示错误方法 
![color-picker-snap](src/moveFolderBug.png)


