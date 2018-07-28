#  常用算法

> 冒泡排序
```js
     function sort(arr) {
        for(var i =0; i < arr.length-1; i++){
            for (var j = 0; j < arr.length-1-i; j++)
                if(arr [j] > arr[j+1]){
                    var temp = arr[j];
                    arr[j] = arr[j+1];
                    arr[j+1] = temp;
                }
        };
        return arr;
    }
```

> 快速排序
```js
    function quickSort( arr ){
        if(arr.length <=1){
            return arr;
        }
        var midIndex = Math.floor(arr.length / 2);
        var midIndexVal = arr.splice(midIndex,1);
        var left = [];
        var right = [];
        for(var i = 0; i < arr.length; i++){
            if( arr[i] < midIndexVal){
                left.push(arr[i]);
            }else{
                right.push(arr[i]);
            }
        }
        return quickSort(left).concat(midIndexVal, quickSort(right));
    }
```

> 选择排序
```js
     function selecSort(arr) {
        var len = arr.length;
        var midIndex, temp;
        for( var i = 0; i < len-1; i++ ) {
            midIndex = i;
            for( var j = i+1; j < len; j++ ){
                if( arr[j] < arr[midIndex]) {
                    midIndex = j;
                }
            }
            temp = arr[i];
            arr[i] = arr[midIndex];
            arr[midIndex] = temp;
        }
        return arr;
    }

```

> 插入排序
```js
    function insertSort(arr) {
        var len = arr.length;
        var perIndex, current;
        for( var i = 1; i < len; i++){
            perIndex = i-1;
            current = arr[i];
            while (perIndex >=0  && arr[perIndex] >current) {
                arr[preIndex+1] = arr[preIndex];
                preIndex--;
            }
            arr[preIndex+1] = current;
        } 
        return arr;
    }

```
> 数组去重
```js
    function delRepeat( arr ){
        var array = new array();
        var len = arr.length;
        for( var i = 0; i < len; i++){
            for( var j = i; j < len; j++ ){
                if( arr[i] == arr[j+1] ) {
                    ++i
                }
            }
            array.push(arr[i]);
        }
        return array;
    }

```

