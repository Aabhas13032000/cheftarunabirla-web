function openPopup() {
    if(document.getElementsByClassName('popUpBox')[0].classList.contains('activepopUpBox')) {
        document.getElementsByClassName('popUpBox')[0].classList.remove('activepopUpBox')
    } else {
        document.getElementsByClassName('popUpBox')[0].classList.add('activepopUpBox')
    }
    if(document.getElementsByClassName('popUpBoxContent')[0].classList.contains('activepopUpBoxContent')) {
        document.getElementsByClassName('popUpBoxContent')[0].classList.remove('activepopUpBoxContent')
    } else {
        document.getElementsByClassName('popUpBoxContent')[0].classList.add('activepopUpBoxContent')
    }
}

function openGalleryPopup() {
    getImageCategories();
    if(document.getElementsByClassName('popUpBoxGallery')[0].classList.contains('activepopUpBoxGallery')) {
        document.getElementsByClassName('popUpBoxGallery')[0].classList.remove('activepopUpBoxGallery')
    } else {
        document.getElementsByClassName('popUpBoxGallery')[0].classList.add('activepopUpBoxGallery')
    }
    if(document.getElementsByClassName('popUpBoxGalleryContent')[0].classList.contains('activepopUpBoxGalleryContent')) {
        document.getElementsByClassName('popUpBoxGalleryContent')[0].classList.remove('activepopUpBoxGalleryContent')
    } else {
        document.getElementsByClassName('popUpBoxGalleryContent')[0].classList.add('activepopUpBoxGalleryContent')
    }
}

//Iframe function call

function searchBox(value) {
    document.getElementById('loaded_page').contentWindow.search(value);
}