## 获取GIF图片时长 ##

### 1.先获取图片路径 ###
``` js
        function getUrl( imge) {
            toBase64(imge.source_url)
        }

```
### 2.将图片转成base64  ###
```  js
    function toBase64(url){
        getBase64(url)
            .then(function(base64){
                var blob =  dataURItoBlob(base64);
                var reader = new FileReader();
                reader.readAsBinaryString(blob); 
                reader.onload = function(e){ 
                    // //base64 TO BUFFER
                    var binary_string =  reader.result; 
                    var len = binary_string.length;
                    var bytes = new Uint8Array( len );
                    for (var i = 0; i < len; i++)        {
                        bytes[i] = binary_string.charCodeAt(i);
                    }
                    var gifInfo = gify.getInfo(bytes.buffer);
                };
            },function(err){
                    console.log(err);
            });                        
    }   
```

### 3.将base64转成 blob ###

```js
     var dataURItoBlob = function( dataURI ) {
        var binary = window.atob(dataURI.split(',')[1]);
        var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
        var array = [];
        for(var i = 0; i < binary.length; i++) {
            array.push(binary.charCodeAt(i));
        }
        return new Blob([new Uint8Array(array)], {type: mimeString});
    };
```

### 4.利用H5 FileReader  读取二进制编码    转为ArrayBuffer  ###

``` js

 function getBase64(img){
    function getBase64Image(img,width,height) {
        var canvas = document.createElement("canvas");
        canvas.width = width ? width : img.width;
        canvas.height = height ? height : img.height;

        var ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        var dataURL = canvas.toDataURL();
        return dataURL;
    }
    var image = new Image();
    image.crossOrigin = '';
    image.src = img;
    var deferred=$.Deferred();
    if(img){
        image.onload =function (){
        deferred.resolve(getBase64Image(image));
        }
        return deferred.promise();
    }
}

```

