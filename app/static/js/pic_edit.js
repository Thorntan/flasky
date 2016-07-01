function setFirstPic(which) {
	var pic = $(which).attr("id");	
	console.log("pic_name:"+pic);
	if (confirm("是否设置图片"+pic+"为首图?")==true){
		//update SQL 
		$.ajax({
			type: "POST",
			url: "ajax/ajax.php?action=pic_set_first",
			dataType: "json",
			data: {
				pic_name: pic
			},
			success: function(data){
				if(data.status==0) {
					console.log(data);
					alert("数据已更新，待下次test上线可见效果。");
				}else{
					console.log(data);
					alert("数据库无法更新，联系程序员!error:"+data.msg);
				}
			},
			error:function(){
				alert("操作失败，请联系程序员");
			}
		});
		return;
	}else{
		return;
	}
}



function deletePic(which) {
	var pic = $(which).attr("id");	
	console.log("pic_name:"+pic);
	if (confirm("是否删除图片"+pic+"?")==true){
		//update SQL 
		$.ajax({
			type: "POST",
			url: "ajax/ajax.php?action=pic_delete",
			dataType: "json",
			data: {
				pic_name: pic
			},
			success: function(data){
				if(data.status==0) {
					console.log(data);
					alert("数据已更新，待下次test上线可见效果。");
				}else{
					console.log(data);
					alert("数据库无法更新，联系程序员!error:"+data.msg);
				}
			},
			error:function(){
				alert("操作失败，请联系程序员");
			}
		});
		return;
	}else{
		return;
	}
}

function test(which) {
	var str = $(which).attr("data");
	var jsonStr = JSON.stringify(str);
	var jsonObj = JSON.parse(str); 
	console.log(jsonObj.mid);
	$.ajax({
		url: "ajax/ajax.php?action=pic_delete",
		type: "POST",
		dataType: "json",
		data: {
			mid:jsonObj.mid,
			img:jsonObj.img,
			img_list:jsonObj.img_list
		},
		success:function(data){
			console.log(data);
			alert("OK");
		},
		error:function(XMLHttpRequest, textStatus, errorThrown){
			console.log(data);
			console.log(XMLHttpRequest+"*"+textStatus+"*"+errorThrown);
			alert("fail"+textStatus);
		}
	});
}

function resetPic(){
	//var pic = $("#newOrder").attr("data")!="": $("#newOrder").attr("data")?"";
	//var order = $("#newOrder").val()!="":$("#newOrder").val()?"";
	//console.log(pic);
	//console.log(order);
	alert(pic);
}
