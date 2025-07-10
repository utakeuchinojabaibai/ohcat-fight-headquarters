function toumei(){
// 要素を取得
  var bun = 1;
let ele = document.getElementById('a');
// 現在の display プロパティの値を保持
const displayOriginal = ele.style.display;
// none に設定して非表示
ele.style.display = 'none';
}
function modoru(){
// 元に戻して表示
  var bun = 0;
ele.style.display = displayOriginal;
}

function bunki(){
if(bun = 0){
toumei();
}else if(bun = 1){
modoru();
}
}
