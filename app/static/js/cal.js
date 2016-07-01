$(function() {
    console.log("----------");
    function submit_form(e) {
        var r = $("[name='a']").val()+$("[name='b']").val();
        $('#result').text(r);
    };
    $('#calculate').bind('click', submit_form);
});
