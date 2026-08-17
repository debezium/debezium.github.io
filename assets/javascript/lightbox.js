// Add this script to your site's JavaScript file or before </body>
document.addEventListener('DOMContentLoaded', function() {
    var modal = document.getElementById('imageModal');
    var modalImage = document.getElementById('modalImage');
    var modalCaption = document.getElementById('modalCaption');
    var closeBtn = document.querySelector('.close');

    // Zoom controls
    var zoomInBtn = document.getElementById('zoomIn');
    var zoomOutBtn = document.getElementById('zoomOut');
    var resetZoomBtn = document.getElementById('resetZoom');

    var currentZoom = 1;
    var zoomStep = 0.5;
    var maxZoom = 3;
    var minZoom = 0.5;
    var isDragging = false;
    var mouseMoved = false;
    var dragStartX = 0, dragStartY = 0;
    var translateX = 0, translateY = 0;

    // Update zoom controls state
    function updateZoomControls() {
        zoomInBtn.disabled = currentZoom >= maxZoom;
        zoomOutBtn.disabled = currentZoom <= minZoom;
    }

    // Apply zoom to image
   function applyZoom() {
       modalImage.style.transform = 'translate(' + translateX + 'px, ' + translateY + 'px) scale(' + currentZoom + ')';
       modalImage.classList.toggle('zoomed', currentZoom > 1);
       updateZoomControls();
   }

   function resetZoom() {
       currentZoom = 1;
       translateX = 0;
       translateY = 0;
       applyZoom();
       modalImage.style.cursor = 'zoom-in';  // reset cursor on zoom reset
   }

    // Add click event to all responsive images.
    //
    // Note the `img` in the selector. Posts commonly set the role on the
    // AsciiDoc block as well as on the image itself, e.g.
    //
    //     [.exampleblock.centered-image.responsive-image]
    //
    // which puts the class on a wrapping <div> too. Binding to the bare class
    // therefore attached the handler to both, and a click on the image ran the
    // <img> handler first and then bubbled to the <div>, whose handler set
    // modalImage.src from an element that has no src - blanking the image that
    // had just been set correctly. Restricting to images fixes it without
    // requiring every post to be re-tagged.
    var images = document.querySelectorAll('img.responsive-image');
    for (var i = 0; i < images.length; i++) {
        images[i].addEventListener('click', function() {
            if (!this.src) { return; }
            modal.style.display = 'block';
            modalImage.src = this.src;
            modalCaption.textContent = this.alt;
            resetZoom();
        });
    }

    // Zoom controls event listeners
    zoomInBtn.addEventListener('click', function() {
        if (currentZoom < maxZoom) {
            currentZoom = Math.min(currentZoom + zoomStep, maxZoom);
            applyZoom();
        }
    });

    zoomOutBtn.addEventListener('click', function() {
        if (currentZoom > minZoom) {
            currentZoom = Math.max(currentZoom - zoomStep, minZoom);
            applyZoom();
        }
    });

    resetZoomBtn.addEventListener('click', resetZoom);

    // Mouse wheel zoom
    modalImage.addEventListener('wheel', function(e) {
        e.preventDefault();

        if (e.deltaY < 0) {
            // Zoom in
            if (currentZoom < maxZoom) {
                currentZoom = Math.min(currentZoom + zoomStep, maxZoom);
                applyZoom();
            }
        } else {
            // Zoom out
            if (currentZoom > minZoom) {
                currentZoom = Math.max(currentZoom - zoomStep, minZoom);
                applyZoom();
            }
        }
    });

    // Mouse drag to pan
    modalImage.addEventListener('mousedown', function(e) {
        if (currentZoom <= 1) return;
        isDragging = true;
        dragStartX = e.clientX - translateX;
        dragStartY = e.clientY - translateY;
        mouseMoved = false;
        modalImage.style.cursor = 'grabbing';

        // Prevent default to avoid unwanted text selection etc.
        e.preventDefault();
    });

    window.addEventListener('mousemove', function(e) {
        if (!isDragging) return;

        var deltaX = e.clientX - dragStartX;
        var deltaY = e.clientY - dragStartY;

         // Consider drag started if moved more than 3 pixels to avoid jitter
        if (!mouseMoved && (Math.abs(deltaX - translateX) > 3 || Math.abs(deltaY - translateY) > 3)) {
            mouseMoved = true;
        }

        if (mouseMoved) {
            translateX = deltaX;
            translateY = deltaY;
            applyZoom();
        }
    });

    window.addEventListener('mouseup', function(e) {
        if (!isDragging) return;

        isDragging = false;
        modalImage.style.cursor = currentZoom > 1 ? 'move' : 'zoom-in';

        if (!mouseMoved) {
            // It was a click, toggle zoom
            if (currentZoom === 1) {
                currentZoom = 2;
            } else {
                currentZoom = 1;
                translateX = 0;
                translateY = 0;
            }
            applyZoom();
        }
    });

    // Touch drag to pan (reusing dragStartX and dragStartY)
    modalImage.addEventListener('touchstart', function(e) {
        if (currentZoom <= 1) return;
        isDragging = true;
        var touch = e.touches[0];
        dragStartX = touch.clientX - translateX;
        dragStartY = touch.clientY - translateY;
    }, { passive: false });

    modalImage.addEventListener('touchmove', function(e) {
        if (!isDragging) return;
        e.preventDefault(); // Prevent scrolling
        var touch = e.touches[0];
        translateX = touch.clientX - dragStartX;
        translateY = touch.clientY - dragStartY;
        applyZoom();
    }, { passive: false });

    modalImage.addEventListener('touchend', function() {
        isDragging = false;
    });

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