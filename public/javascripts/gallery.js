function addGalleryImages(event) {
    event.preventDefault();
    var gallery = document.getElementsByClassName("gallery_image_path");
    var categories_form = document.getElementById('categories_form').value;

    // console.log(categories_form);
    var gallery_values = [];
    if(gallery.length != 0) {
        for(var i =0;i<gallery.length;i++) {
            gallery_values.push(gallery[i].value);
        }
        // console.log(gallery_values);
        $.ajax({
            url : '/addGalleryImages',
            dataType: "json",
            type: "POST",
            data: {
                categories_form:categories_form,
                images:gallery_values
            },
            success: function(response){
                alert('Images added successfully');
                location.reload();
            },
            error: function(err){
                console.log(err);
                alert('Some error occured !!');
            }
        });
    } 
    // else {
    //     alert('Select some images to add !!');
    // }
}

function getImageCategories() {
    $.ajax({
            url : '/getCategories',
            dataType: "json",
            type: "GET",
            success: function(response){
                var select = document.getElementById("categories_form");
                var length = select.options.length;
                for (var i = length-1; i >= 0; i--) {
                    select.options[i] = null;
                }
                if(response.data.length != 0){
                    var option2 = document.createElement("option");
                    option2.text = 'Select Category';
                    option2.value= '';
                    select.add(option2);
                  for(var i=0;i<response.data.length;i++){
                    var option = document.createElement("option");
                    option.text = response.data[i].name;
                    option.value= response.data[i].id;
                    select.add(option);
                  }
                } else {
                    var option = document.createElement("option");
                    option.text = "No District present";
                    option.value= '0';
                    select.add(option);
                    document.getElementById("categories_form").setAttribute('disabled',true);
                }
            },
            error: function(err){
                console.log(err);
                alert('Some error occured !!');
            }
        });
  }

  function openLocalStorage() {
    $('#imgupload').trigger('click');
  }

  function getAllImages() {
      var imageFiles = document.getElementById('imgupload').files;
    //   console.log(imageFiles);
      var form = new FormData();
    //   document.getElementById('preview').innerHTML = '';

      for(var i=0;i<imageFiles.length;i++){
        if(imageFiles[i] != undefined){
            form.append(`gallery_images`, imageFiles[i]);
        }
      }

    $.ajax({
        url : "/saveGalleryImages",
        type: "POST",
        cache: false,
        contentType: false,
        processData: false,
        data : form,
        success: function(response){
            console.log(response.files);
            for(var i=0;i<response.files.length;i++) {
                var path = window.location.href + response.files[i].path.slice(7,response.files[i].path.length);
                $('#preview').append('<div class="col-6" id="gallery_image_'+ path +'"><div class="card preview" id="append_image_'+ path +'"><a class="delete_gallery_image" onclick="deleteCurrentGalleryImage(\''+ ( "gallery_image_"+ path )  +'\',\'gallery_image_path_'+ path +'\')"><span class="iconify" data-icon="akar-icons:cross"></span></a><img src="'+ path +'" id="preview_galler_image_'+ path +'" alt=""><input type="hidden" class="gallery_image_path" name="gallery_image_path" id="gallery_image_path_'+ path +'" value="'+ path +'"></div></div>');
            }
            document.getElementById('imgupload').value='';
        },
        error: function(err){
            console.log(err.status);
        }
    });
  }

function deleteCurrentGalleryImage(id,input_id) {
    var path = document.getElementById(input_id).value;
    console.log(path);
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
                document.getElementById(id).remove();
            },
            error: function(err){
                console.log(err);
                alert('Some error occured !!');
            }
        });
    }
}