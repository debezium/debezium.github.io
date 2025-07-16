// Add this script to your site's JavaScript file or before </body>
document.addEventListener('DOMContentLoaded', function() {
    var modal = document.getElementById('imageModal');
    var modalImage = document.getElementById('modalImage');
    var modalCaption = document.getElementById('modalCaption');
    var closeBtn = document.querySelector('.close');

    // Add click event to all responsive images
    var images = document.querySelectorAll('.responsive-image');
    for (var i = 0; i < images.length; i++) {
        images[i].addEventListener('click', function() {
            modal.style.display = 'block';
            modalImage.src = this.src;
            modalCaption.textContent = this.alt;
        });
    }

    // Close modal when clicking the X
    closeBtn.addEventListener('click', function() {
        modal.style.display = 'none';
    });

    // Close modal when clicking outside the image
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });

    // Close modal with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.style.display === 'block') {
            modal.style.display = 'none';
        }
    });
});