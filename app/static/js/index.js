
// 切换tab时，对点击动作进行判断，如果是默认的，则不需要查询。如果是test或online环境，则需要做查询
$(function(){
	$("#test").click(function(){
			$("#loading").hide();
			$("#table2").hide();
			$("#default_table").show();
	});
});

$(function(){
	$("#online").click(function(){
		doQuery("online");
	});
});

$(function(){
	$("#dev").click(function(){
		doQuery("dev");
	});
});

// 发post请求, 查询test或online环境的数据
function doQuery(environment) {

    $.ajax({
        type: "POST",
        url: "api/cities",
        dataType: "json",
        data: {
			"environment":environment
        },
        beforeSend: function() {
			$("#default_table").hide();
			$("#table2").hide();
			$("#loading").show();
        },
        //complete: function() {
        //    $("#over").css("display","none");
        //},
        success: function(data) {
			// 如果请求成功，查询结果返回json，json的status值为0则查询返回了正确数据，status为1则查询没有结果
            if (data.status == 0) {
				makeTable(data.result);
            } else {
                console.log("wrongwrong");
                alert(data.result);
            }
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) {
            alert("服务器传输错误");
        }
    });
}

// 构造一个table，将查询的数据都放到table里展示。参数是一个list,每个元素都有id,name,country等属性
function makeTable(list) {
	var new_table = "";
	list.forEach(function(i){
		var row = "";
		row += add_col(i.id);
		row += add_col(i.name);
		row += add_col(i.country);
		row += add_col(i.visit_num);
		row += add_col(i.city_status);
		row += add_col(i.hotel_total);
		row += add_col(i.hotel_image_percentage);
		row += add_col(i.hotel_comment_percentage);
		row += add_col(i.attr_total);
		row += add_col(i.attr_image_percentage);
		row += add_col(i.attr_comment_percentage);
		row += add_col(i.rest_total);
		row += add_col(i.rest_image_percentage);
		row += add_col(i.rest_comment_percentage);
		row += add_col(i.shop_total);
		row += add_col(i.shop_image_percentage);
		row += add_col(i.shop_comment_percentage);
		new_table += add_row(row);
	});	
	var len = list.length;
	$("#loading").hide();
	$("#table2").show();
	$("#table2_result").html( new_table );
}


function add_row(string){
	return "<tr>"+string+"</tr>";
}

function add_col(string){
	return "<td>"+string+"</td>";
}

