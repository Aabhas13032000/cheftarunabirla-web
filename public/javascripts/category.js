function checkCategory(name) {
    if(document.getElementById('name').classList.contains('is-invalid')) {
        document.getElementById('name').classList.remove('is-invalid')
    }
    if(document.getElementById('name').classList.contains('is-valid')) {
        document.getElementById('name').classList.remove('is-valid')
    }
    if(name.length != 0){
        $.ajax({
            url : `/checkCategory/${name}`,
            dataType: "json",
            type: "GET",
            success: function(response){
                if(response.data.length == 0){
                    document.getElementById('category_verify').removeAttribute('disabled');
                    document.getElementById('name').classList.add('is-valid');
                } else {
                    document.getElementById('category_verify').setAttribute('disabled','disabled');
                    document.getElementById('name').classList.add('is-invalid');
                }
                console.log(response);
            },
            error: function(err){
                console.log(err);
                alert('Some error occured !!');
            }
        });
    } else {
        document.getElementById('category_verify').setAttribute('disabled','disabled');
        if(document.getElementById('name').classList.contains('is-invalid')) {
            document.getElementById('name').classList.remove('is-invalid')
        }
        if(document.getElementById('name').classList.contains('is-valid')) {
            document.getElementById('name').classList.remove('is-valid')
        }
    }
}

function changePreview() {
    var fileForm = new FormData();
    var image = document.getElementById('category_image').files[0];
    if(image != undefined) {
        fileForm.append('category_image',image);
        $.ajax({
            url : "/uploadCategoryImage",
            type: "POST",
            cache: false,
            contentType: false,
            processData: false,
            data : fileForm,
            success: function(response){
                var path = window.location.href + response.path.slice(7,response.path.length);
                document.getElementById('category_image_path').value = path;
                document.getElementById('preview_image').setAttribute('src',path);
                document.getElementById('delete_button').style.display = 'flex';
            },
            error: function(err){
                console.log(err.status);
                alert('Some error occured !!');
                location.reload();
            }
        });
    }
}

function deleteCurrentImage() {
    var path = document.getElementById('preview_image').getAttribute('src');
    if(path != '/images/extra/nopreview.jpeg') {
        $.ajax({
            url : '/deletePhoto',
            dataType: "json",
            type: "POST",
            data: {
                path:path
            },
            success: function(response){
                alert('Removed Successfully');
                document.getElementById('category_image').value = '';
                document.getElementById('preview_image').setAttribute('src','/images/extra/nopreview.jpeg');
                document.getElementById('delete_button').style.display = 'none';
            },
            error: function(err){
                console.log(err);
                alert('Some error occured !!');
            }
        });
    }
}

function addCategory(event) {
    var category_name = document.getElementById('name').value;
    var image_path = document.getElementById('category_image_path').value;
    $.ajax({
        url : '/addCategory',
        dataType: "json",
        type: "POST",
        data: {
            name:category_name,
            image:image_path
        },
        success: function(response){
            document.getElementById('name').value = '';
            document.getElementById('category_image_path').value = '';
            document.getElementById('category_image').value = '';
            document.getElementById('preview_image').setAttribute('src','/images/extra/nopreview.jpeg');
            document.getElementById('delete_button').style.display = 'none';
            document.getElementById('add_category_alert').style.display = 'block';
            document.getElementById('category_verify').setAttribute('disabled','disabled');
            if(document.getElementById('name').classList.contains('is-invalid')) {
                document.getElementById('name').classList.remove('is-invalid')
            }
            if(document.getElementById('name').classList.contains('is-valid')) {
                document.getElementById('name').classList.remove('is-valid')
            }
            setTimeout(() => {
                if(document.getElementsByClassName('popUpBox')[0].classList.contains('activepopUpBox')) {
                    document.getElementsByClassName('popUpBox')[0].classList.remove('activepopUpBox')
                }
                if(document.getElementsByClassName('popUpBoxContent')[0].classList.contains('activepopUpBoxContent')) {
                    document.getElementsByClassName('popUpBoxContent')[0].classList.remove('activepopUpBoxContent')
                }
                document.getElementById('add_category_alert').style.display = 'none';
            },1000);
            setTimeout(() => {
                location.reload();
            },1200);
        },
        error: function(err){
            console.log(err);
            alert('Some error occured !!');
        }
    });
    event.preventDefault();
}

function editCategory(id) {
    openPopup();
}