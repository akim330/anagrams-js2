function draw() {
    var canvas = document.getElementById('canvas');
    var ctx = canvas.getContext('2d');
  
    var rhino_img = document.getElementById('source')
    // Draw slice
    ctx.drawImage(rhino_img,
                  33, 71, 104, 124, 21, 20, 87, 104);

    ctx.drawImage(rhino_img,
                  33, 71, 104, 124, 121, 120, 87, 104);

  }