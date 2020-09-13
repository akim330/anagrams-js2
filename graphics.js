// Colors
var WHITE = 'rgb(255, 255, 255)';
var BLACK = 'rgb(0,0,0)';
var NAVYBLUE = 'rgb(60, 60, 100)';
var GREEN = 'rgb(0, 255, 0)';
var BLUE = 'rgb(0, 0, 255)';
var GRAY = 'rgb(230, 230, 230)';

var BGCOLOR = WHITE;
var TEXTCOLOR = BLACK;

// Dimensions
var WINDOWWIDTH = 1000;
var WINDOWHEIGHT = 800;

var letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

Graphics = function(){
    console.log("Initializing graphics")
    this.canvas = {
        'current': document.getElementById('canvas_current'),
        'flip': document.getElementById('canvas_flip'),
        'tiles': document.getElementById('canvas_tiles'),
        'your': document.getElementById('canvas_your'),
        'self_words': document.getElementById('canvas_self_words'),
        'opp': document.getElementById('canvas_opp'),
        'opp_words': document.getElementById('canvas_opp_words'),
        'guess': document.getElementById('canvas_guess'),
        'status': document.getElementById('canvas_status')
    }

    this.ctx = {
        'current': this.canvas.current.getContext('2d'),
        'flip': this.canvas.flip.getContext('2d'),
        'tiles': this.canvas.tiles.getContext('2d'),
        'your': this.canvas.your.getContext('2d'),
        'self_words': this.canvas.self_words.getContext('2d'),
        'opp': this.canvas.opp.getContext('2d'),
        'opp_words': this.canvas.opp_words.getContext('2d'),
        'guess': this.canvas.guess.getContext('2d'),
        'status': this.canvas.status.getContext('2d')
    }
    this.ctx.tiles.translate(0.5, 0.5);
    this.ctx.tiles.ImageSmoothingEnabled = false;


    // CANVAS LOCATION
    this.canvas.current.style.top = '20px';
    this.canvas.current.style.left = '10px';

    this.canvas.flip.style.top = '55px';
    this.canvas.flip.style.left = '12px';

    this.canvas.tiles.style.top = '25px';
    this.canvas.tiles.style.left = '150px';

    this.canvas.your.style.top = '100px';
    this.canvas.your.style.left = '10px';

    this.canvas.self_words.style.top = '150px';
    this.canvas.self_words.style.left = '10px';

    this.canvas.opp.style.top = '100px';
    this.canvas.opp.style.left = '510px';

    this.canvas.opp_words.style.top = '150px';
    this.canvas.opp_words.style.left = '510px';

    this.canvas.guess.style.top = '650px';
    this.canvas.guess.style.left = '10px';

    this.canvas.status.style.top = '700px';
    this.canvas.status.style.left = '10px';


    /*
    this.canvas.current.width = '140px';
    this.canvas.current.height = '25px';
    this.canvas.flip.width = '100px';
    this.canvas.flip.height = '30px';
    this.canvas.your.width = '200px';
    this.canvas.your.height = '50px';
    this.canvas.self_words.width = '470px';
    this.canvas.self_words.height = '510px';
    this.canvas.opp.width = '400px';
    this.canvas.opp.height = '50px';
    this.canvas.opp_words.width = '470px';
    this.canvas.opp_words.height = '510px';
    this.canvas.guess.width = '500px';
    this.canvas.guess.height = '100px';
    this.canvas.status.width = '900px';
    this.canvas.status.height = '100px';
    */

    /*
    var current_style = document.getElementById("div_current").style
    var flip_style = document.getElementById("div_flip").style
    var tiles_style = document.getElementById("div_tiles").style
    var your_style = document.getElementById("div_your").style
    var self_words_style = document.getElementById("div_self_words").style
    var opp_style = document.getElementById("div_opp").style
    var opp_words_style = document.getElementById("div_opp_words").style
    var guess_style = document.getElementById("div_guess").style
    var status_style = document.getElementById("div_status").style

    this.canvas_xy = {
        'current': {x: current_style.x, y: current_style.y},
        'flip': {x: flip_style.x, y: flip_style.y},
        'tiles': {x: tiles_style.x, y: tiles_style.y},
        'your': {x: your_style.x, y: your_style.y},
        'self_words': {x: self_words_style.x, y: self_words_style.y},
        'opp': {x: opp_style.x, y: opp_style.y},
        'opp_words': {x: opp_words_style.x, y: opp_words_style.y},
        'guess': {x: guess_style.x, y: guess_style.y},
        'status': {x: status_style.x, y: status_style.y},
    }
    

    this.canvas_dims = {
        'current': {x: current_style.x, y: current_style.y},
        'flip': {x: flip_style.x, y: flip_style.y},
        'tiles': {x: tiles_style.x, y: tiles_style.y},
        'your': {x: your_style.x, y: your_style.y},
        'self_words': {x: self_words_style.x, y: self_words_style.y},
        'opp': {x: opp_style.x, y: opp_style.y},
        'opp_words': {x: opp_words_style.x, y: opp_words_style.y},
        'guess': {x: guess_style.x, y: guess_style.y},
        'status': {x: status_style.x, y: status_style.y},
    }
    */

    this.first_time = true;
    
    this.gap_factor = 1.5;

    this.default_font = 'px Arial Black';
    this.default_color = BLACK;

    this.gap_factor = 1.5;

    this.default_size_tiles = 32;
    this.default_tiles_per_row = (this.canvas.tiles.width / (this.default_size_tiles * this.gap_factor));

    this.default_size_words = this.default_size_tiles;
    this.default_words_per_col = (this.canvas.self_words.height / (this.default_size_words * this.gap_factor));

    this. tile_dict = {};
    for (let i = 0; i < letters.length; i++){
        let letter = letters[i];
        
        this.tile_dict[letter] = document.getElementById(letter);
    }
    this.tile_orig_width = this.tile_dict['A'].naturalWidth;
    this.tile_orig_height = this.tile_dict['A'].naturalHeight;

    // 'Current' before tiles
    this.current = {
        'font': this.default_font,
        'size': 24,
        'color': this.default_color, 
        'x': 10,
        'y': 20
    }

    // Flip status
    this.flip = {
        'font': this.default_font,
        'size': 14, 
        'color': this.default_color,
        'x': 20,
        'y': 60
    }

    // Tiles 
    this.tiles = {
        'font': this.default_font,
        'size': 32,
        'color': this.default_color,
        'x_0': 150,
        'y_0': 38,
        'x_gap': 30, 
        'y_gap': 50
    }

    // 'Your Words' (the text above your words)
    this.your = {
        'font': this.default_font,
        'size': 24,
        'color': this.default_color,
        'x': 10,
        'y': 100,
        'y_gap': 70
    }

    // Your words (the actual words themselves)
    this.self_words = {
        'font': this.default_font, 
        'size': 48, 
        'color': this.default_color, 
        'x': 30,
        'y': this.your.y + this.your.y_gap,
        'x_gap': 150, 
        'y_gap': 50
    }

    // 'Opponent's Words' (the text above your words)
    this.opp = {
        'font': this.default_font,
        'size': 24, 
        'color': this.default_color,
        'x': WINDOWWIDTH / 2 + 10,
        'y': 100,
        'y_gap': 70
    }

    // Opponent's words (the words themselves)
    this.opp_words = {
        'font': this.default_font,
        'size': 48,
        'color': this.default_color, 
        'x': WINDOWWIDTH / 2 + 30,
        'y': this.opp.y + this.opp.y_gap,
        'x_gap': 150,
        'y_gap': 50
    }

    // Guess
    this.guess = {
        'font': this.default_font,
        'size': 32,
        'color': this.default_color,
        'x': 10,
        'y': WINDOWHEIGHT - 140
    }

    // Status
    this.status = {
        'font': this.default_font,
        'size': 20,
        'color': this.default_color,
        'x': 10, 
        'y': WINDOWHEIGHT - 100
    }

    this.color_taken = BLUE;

    /*
    this.loadImages = function(letters){
        var result = {};
        var tile_dict = {};

        for (let i = 0; i < letters.length; i++){
            let letter = letters[i];
            
            tile_dict[letter] = document.getElementById(letter);

        }
        return tile_dict;
    } */

    scaleIt = function(source, scaleFactor){
        var c = document.createElement('canvas');
        var ctx_temp = c.getContext('2d');
        var w = source.width * scaleFactor;
        var h = source.height * scaleFactor;
        c.width = w;
        c.height = h;
        ctx_temp.drawImage(source, 0, 0, w, h);
        return(c);
    }

    this.draw_tile = function(ctx, img, x, y, size){
        original_width = img.width;
        scale_factor = size / img.width;
        root_scale = Math.sqrt(scale_factor);

        // scale the 1000x669 image in half to 500x334 onto a temp canvas
        var c1 = scaleIt(img, root_scale);
        
        final_width = c1.width * root_scale;
        final_height = c1.height * root_scale;
        // scale the 500x335 canvas in half to 250x167 onto the main canvas
        ctx.drawImage(c1, x, y, final_width, final_height);
    }

    this.draw_word = function(ctx, word, x, y, size){
        console.log(`Drawing word ${word}`);
        for (let i = 0; i < word.length; i++){
            // ctx.drawImage(this.tile_dict[word.charAt(i)], x, y, size, size);
            this.draw_tile(ctx, this.tile_dict[word.charAt(i)], x, y, size);
            x += size;
        }
    }

    this.draw_word_list = function(ctx, words_list){
        if (words_list.length <= this.default_words_per_col * 2){
            var size_words = this.default_size_words;
            var words_per_col = Math.floor(this.canvas.self_words.height / (size_words * this.gap_factor));
        }
        else{
            var size_words = this.default_size_words/ 1.5;
            var words_per_col = Math.floor(this.canvas.self_words.height / (size_words * this.gap_factor));
        }

        var x_gap = size_words;
        var y_gap = size_words * 1.5;
        var x = 0;
        var y = 0;
        var second_column = false;

        var word_end_x = [];

        for (let i = 0; i < words_list.length; i++){

            if (second_column){
                this.draw_word(ctx, words_list[i], word_end_x[i - words_per_col], y, size_words);
            }
            else{
                this.draw_word(ctx, words_list[i], 0, y, size_words);
            }

            if (i % words_per_col == words_per_col - 1){
                second_column = true;
                y = 0;
            }
            else{
                y += y_gap
            }

            word_end_x.push(words_list[i].length * size_words + x_gap);
        }
    }

    this.update_display = function(game, player, graphics_to_update, guess, status){
        var gap_btwn_cols = 10;

        if (graphics_to_update.includes('self_words')){
            if (player == 1){
                var self_words_list = game.player1words_list;
                var opp_words_list = game.player2words_list;
            }
            else{
                var self_words_list = game.player2words_list;
                var opp_words_list = game.player1words_list;
            }
        }

        if (graphics_to_update.includes('flip')){
            this.ctx.flip.clearRect(0, 0, this.canvas.flip.width, this.canvas.flip.height);
            this.ctx.flip.font = this.flip.size.toString() + this.default_font;
            this.ctx.flip.fillStyle = this.default_color;
            this.ctx.flip.fillText(game.flip_status, 0, this.flip.size + 5);
        }

        if (graphics_to_update.includes('guess')){
            this.ctx.guess.clearRect(0, 0, this.canvas.guess.width, this.canvas.guess.height);
            this.ctx.guess.font = this.guess.size.toString() + this.default_font;
            this.ctx.guess.fillStyle = this.default_color;
            this.ctx.guess.fillText('Guess: ' + guess, 0, this.guess.size);
        }

        if (graphics_to_update.includes('status')){
            this.ctx.status.clearRect(0, 0, this.canvas.status.width, this.canvas.status.height);
            this.ctx.status.font = this.status.size.toString() + this.default_font;
            this.ctx.status.fillStyle = this.default_color;
            this.ctx.status.fillText(status, 0, this.status.size);
        }

        if (graphics_to_update.includes('tiles')){
            this.ctx.tiles.clearRect(0, 0, this.canvas.tiles.width, this.canvas.tiles.height);
            // Based on how many tiles there are, calculate tile size and tiles per row
            // console.log(`Current length: ${game.current.length}`);
            // console.log(`Tiles per row: ${this.default_tiles_per_row}`);
            if (game.current.length <= this.default_tiles_per_row * 2){
                // console.log(`Go with default tile size: ${this.default_size_tiles}`);
                var size_tiles = this.default_size_tiles;
                var tiles_per_row = Math.floor(this.canvas.tiles.width / (size_tiles * this.gap_factor));
            }
            else{
                var size_tiles = this.default_size_tiles / 1.5;
                var tiles_per_row = Math.floor(this.canvas.tiles.width / (size_tiles * this.gap_factor));
            }

            var x_gap = size_tiles * 1.2;
            var y_gap = size_tiles * 1.2;
            var x = 0;
            var y = 0;

            for (let i = 0; i < game.current.length; i++){
                // console.log(`Size of tiles: ${size_tiles}`)
                // this.ctx.tiles.drawImage(this.tile_dict[game.current[i]], x, y, size_tiles, size_tiles);
                this.draw_tile(this.ctx.tiles, this.tile_dict[game.current[i]], x, y, size_tiles);

                if (i % tiles_per_row == tiles_per_row - 1){
                    x = 0;
                    y += y_gap;
                }
                else{
                    x += x_gap
                }
            }
        }

        if (graphics_to_update.includes('self_words')){
            console.log(`Updating self words: ${self_words_list}`);
            this.ctx.self_words.clearRect(0, 0, this.canvas.self_words.width, this.canvas.self_words.height);
            this.draw_word_list(this.ctx.self_words, self_words_list);
        }

        if (graphics_to_update.includes('opp_words')){
            console.log(`Updating opp words: ${opp_words_list}`);
            this.ctx.opp_words.clearRect(0, 0, this.canvas.opp_words.width, this.canvas.opp_words.height);
            this.draw_word_list(this.ctx.opp_words, opp_words_list);
        }
    }

    this.display_init = function(){
        // Run only when you start the game, displays the fixed things that won't change

        // Display "Current:"
        this.ctx.current.font = this.current.size.toString() + this.default_font;
        this.ctx.current.fillStyle = this.default_color;
        this.ctx.current.fillText('Current:', 0, this.current.size);
        
        // Display "Your Words:"
        this.ctx.your.font = this.your.size.toString() + this.default_font;
        this.ctx.your.fillStyle = this.default_color;
        this.ctx.your.fillText('Your Words:', 0, this.your.size);
        
        // Display "Opponent's Words:"
        this.ctx.opp.font = this.opp.size.toString() + this.default_font;
        this.ctx.opp.fillStyle = this.default_color;
        this.ctx.opp.fillText('Opponent\'s Words:', 0, this.opp.size);
        
        // Guess
        this.ctx.guess.font = this.guess.size.toString() + this.default_font;
        this.ctx.guess.fillStyle = this.default_color;
        this.ctx.guess.fillText('Guess: ' + guess, 0, this.guess.size);
    }
}