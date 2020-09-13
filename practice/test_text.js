function draw() {
    var canvas_current = document.getElementById('canvas_current');
    var canvas_your = document.getElementById('canvas_your');
    var canvas_opp = document.getElementById('canvas_opp');
    var ctx_current = canvas_current.getContext('2d');
    var ctx_your = canvas_your.getContext('2d');
    var ctx_opp = canvas_opp.getContext('2d');

    canvas_your.style.position = 'absolute';
    canvas_your.style.top = '100px';
    canvas_your.style.left = '100px'

    size = 32;
    default_font = 'px Arial Black';
    default_color = 'rgb(0,0,0)';
    
    // Display "Current:"
    ctx_current.font = size.toString() + default_font;
    ctx_current.fillStyle = default_color;
    ctx_current.fillText('Current', 0, size);
    
    
    // Display "Your Words:"
    ctx_your.font = size.toString() + default_font;
    ctx_your.fillStyle = default_color;
    ctx_your.fillText('Your Words:', 0, size);
    
    // Display "Opponent's Words:"
    ctx_opp.font = size.toString() + default_font;
    ctx_opp.fillStyle = default_color;
    ctx_opp.fillText('Opponent\'s Words:', 0, size);
    
  }