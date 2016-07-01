var grid;//定义表格
//设置列，name为表头显示名称，field为对应域的名字
var columns = [
      {id:"title", name: "Title", field: "title"},
      {id:"duration", name: "Duration", field: "duration"}
    ];
//设置表格参数
var options = {
   enableCellNavigation:true,
   enableColumnReorder:false
 };
//定义表格数据变量
$(function () {
    var data = [];
//生成表格数据
   for (var i = 0; i< 100; i++) {
    data[i] = {
      title: "Task " + i,
      duration: "5 days"
    };
   }
//创建grid，“myGrid”为表格生成位置的ID
   grid = new Slick.Grid("#myGrid", data, columns, options);
})

var aa;
