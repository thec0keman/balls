Balls = (function(){
  BALL_HEIGHT = 15; // Size of a ball
  COLLISION = 5; // Flag for collision
  GRAVITY = 1; // Gravity constant, never changes
  grav_counter = 0;
  FRICTION = .05;
  tick_counter = 0; // Counter for ball
  BALL_SPEED = 30; // Speed of animation
  obstacles = null;
  NUM_OBSTACLES = 0;
  balls = null;
  NUM_OF_BALLS = 50;
  timer = null; // Timer object
  BORDER_TOP = 35;
  BORDER_BOT = window.innerHeight + 50;
  BORDER_LEFT = BALL_HEIGHT / 2;
  BORDER_RIGHT = window.innerWidth - 35;

  function Ball( id ){
    this.id = id;
    this.x = 0;
    this.y = BORDER_TOP;
    this.old_x = 0;
    this.old_y = 0;
    this.vel = { up: 0, left: 0 };
    this.ball_start = 0;
    this.alive = false;
    c = ( id >= NUM_OF_BALLS / 2 ) ? "ball yellow" : "ball";
    this.el = $('<div />', { 'id': "ball" + this.id, 'class': c });
    $('body').append( this.el );
  }
  Ball.prototype.show = function(){
    this.el.show();
  };
  Ball.prototype.hide = function(){
    this.el.hide();
    this.alive = false;
    this.y = 0;
  };
  Ball.prototype.draw = function(){
    $("#ball" +  this.id).offset({ top: this.y, left: this.x });
  };
  Ball.prototype.move = function(){
    if ( this.alive) {
      if ( !this.el.is(":visible") )
        this.show();
      this.old_x = this.x;
      this.old_y = this.y;
      this.vel.up -= GRAVITY;
      if ( Math.abs(this.vel.left) >= FRICTION )
        this.vel.left += ( this.vel.left > 0 ) ? FRICTION * -1 : FRICTION;
      else
        this.vel.left = 0;
      this.x -= this.vel.left;
      this.y -= this.vel.up;
    }
  };
  Ball.prototype.check_obstacles = function() {
    for( g = 0; g < NUM_OBSTACLES; g++ ) {
      el = obstacles[g];
      collision = false;

      // First check the bottom of el for hit from below
      if (( this.x + BALL_HEIGHT >= el.left ) && ( this.x <= el.right )) {
        if (( this.old_y >= el.bottom ) && ( this.y <= el.bottom )) {
          this.vel.up *= -.5;
          this.old_y = el.bottom + 1;
          this.y = el.bottom + 1;
          collision = true;
        }
        //  Second check the top el for hit from above
        if (( this.old_y + BALL_HEIGHT <= el.top ) && ( this.y + BALL_HEIGHT >= el.top )) {
          this.vel.up *= -.5;
          this.old_y = el.top - BALL_HEIGHT - 1;
          this.y = el.top - BALL_HEIGHT - 1;
          collision = true;
        }
      } 
      // check side hits
      if (( this.y + BALL_HEIGHT >= el.top ) && ( this.y <= el.bottom )) {
        // right side collision for hit from the left
        if (( this.old_x > el.right ) && ( this.x <= el.right )) {
          this.vel.left *= -.5;
          this.old_x = el.right;
          this.x = el.right;
          collision = true;
        }
        // left collision for hit from the right
        if (( this.old_x + BALL_HEIGHT < el.left ) && ( this.x + BALL_HEIGHT >= el.left )) {
          this.vel.left *= -.5;
          this.old_x = el.left - BALL_HEIGHT;
          this.x = el.left - BALL_HEIGHT;
          collision = true;
        }
      }
      if ( collision ) 
        g--;
    }
  }

  function Obstacle( id, obj ) {
    this.id = "ob" + id;
    this.el = $('<div/>', { 'id': this.id, 'class': 'obj' });
    this.el.offset( obj );
    this.el.height( obj.height );
    this.el.width( obj.width );
    $('body').append( this.el );
    this.left = this.el.offset().left;
    this.top = this.el.offset().top;
    this.bottom = this.top + this.el.height();
    this.right = this.left + this.el.width();
  }

  function init() {
    build_obstacles();
    balls = new Array(NUM_OF_BALLS);
    for ( t = 0; t < NUM_OF_BALLS; t++ ) 
      balls[t] = new Ball( t );
    init_balls();
  }

  function build_obstacles() {
    bar = $('.nav_con_top');
    but1 = $('.nav_but_down');
    but2 = $('#reading');
    win_height = window.innerHeight - 34;
    win_width = window.innerWidth- 15;
    object_defaults = [
      { top: -100,              left: 0,            width: win_width,        height: 105 }, // Top side
      { top: 0,                 left: -100,         width: 102,              height: window.innerHeight + 50 }, // Left side
      { top: 0,                 left: win_width,    width: 100,              height: window.innerHeight + 50 }, // Right side
      { top: win_height,        left: 480,          width: 600,              height: 30 }, // Bottom bar
      { top: bar.offset().top,  left: bar.width(),  width: 10,               height: but1.height() * 2 + 20 }, // Upper hor bar
      { top: bar.offset().top,  left: 0,            width: bar.width(),      height: 10 }, // Upper vert bar
      { top: but2.offset().top, left: 0,            width: but2.width() / 2, height: 10 }, // Mid hor bar
      { top: but2.offset().top, left: but2.width(), width: 10,               height: but2.height() * 2 } // Mid vert bar
    ];

    NUM_OBSTACLES = object_defaults.length;
    obstacles = new Array(NUM_OBSTACLES);
    for (var t = 0; t < NUM_OBSTACLES; t++)
      obstacles[t] = new Obstacle( t, object_defaults[t] );
  }
  
  // Re-initializes all balls, starting from bottom and top, randomized velocities
  function init_balls() {
    for (var t = 0; t < NUM_OF_BALLS; t++) {
      // only reset balls that have fallen off the screen
      if ( !balls[t].alive ) {
        balls[t].alive = true;
        balls[t].vel.up = (Math.random()*10) * -1;  // 1-10
        balls[t].vel.left = (Math.random()*50) - 25;  // -25 to 25

        // First half of balls, top half of screen 
        if ( t < (NUM_OF_BALLS/2) ) {
          balls[t].y = BORDER_TOP;
          balls[t].x = BORDER_RIGHT / 2 + ((Math.random()*200)-100);  // Middle
          balls[t].ball_start = Math.floor(Math.random()*100);
        } else { 
        // second half of balls, middle right of screen
          balls[t].y = BORDER_BOT / 2;   // position halfway up
          balls[t].x = BORDER_RIGHT - BALL_HEIGHT;  // position all the way right
          balls[t].vel.left -= 25;  // all shoot left
          balls[t].vel.left *= 3;   // shoot faster
          balls[t].vel.up *= -2.5;  // spread
          balls[t].ball_start = 40 + Math.floor(Math.random()*50);
        }
      } else {
        // motion to remove stagnant balls
        balls[t].vel.left += Math.random() * 50;
      }
    }
  }

  // primary function for balls
  function main_loop() {
    if ( GRAVITY > 0 ) {
      if ( Math.floor(Math.random()*5001) < 2 ) {
        grav_counter = 0;
        GRAVITY *= -1;
      }
    } else {
      if ( grav_counter++ > 400 )
        GRAVITY *= -1;
    }

    animate_balls();

    // Every 200 ticks fling balls off screen
    if ( tick_counter++ > 200 ) {
      tick_counter = 0;
      init_balls();
    }
  }

  // controls motion of ball
  function animate_balls() {
    for (var t = 0; t < NUM_OF_BALLS; t++) {
      if ( balls[t].ball_start > 0 ) {
        balls[t].ball_start--;
      } else if ( balls[t].alive ) {
        balls[t].move();
        if ( balls[t].y + BALL_HEIGHT > BORDER_BOT )
          balls[t].hide();
        balls[t].check_obstacles();
        collision_detect(t);
        balls[t].draw();
      }
    }
  }

  function distance_calc( b1, b2 ){
    var x_distance = b1.x - b2.x;
    var y_distance = b1.y - b2.y;
    return parseInt( Math.sqrt( Math.pow( x_distance, 2 ) + Math.pow( y_distance, 2 ) ) );
  }

  function collision_detect(num) {
    for (var g = 0; g < NUM_OF_BALLS; g++) {

      // don't scan self or inactives
      if ((g != num) && (balls[g].alive) ) {

        distance = distance_calc( balls[num], balls[g] );
        if ( (distance > -BALL_HEIGHT ) && (distance < BALL_HEIGHT ) ) {

          // store current velocities
          var up1 = balls[num].vel.up;
          var left1 = balls[num].vel.left;
          var up2 = balls[g].vel.up;
          var left2 = balls[g].vel.left;

          // proportions each axis needs to move
          var total_ball1 = Math.abs(up1) + Math.abs(left1);
          var percent_x1 = Math.abs(left1) / total_ball1;
          var percent_y1 = Math.abs(up1) / total_ball1;
          var total_ball2 = Math.abs(up2) + Math.abs(left2);
          var percent_x2 = Math.abs(left2) / total_ball2;
          var percent_y2 = Math.abs(up2) / total_ball2;

          // proportions each ball needs to move
          var pixels_to_move = BALL_HEIGHT - Math.abs(distance);  // total pixels to move
          var percent_ball1 = total_ball1 / ( total_ball1 + total_ball2 );
          var percent_ball2 = total_ball2 / ( total_ball1 + total_ball2 );

          // Translate reflections
          if ( balls[num].x > balls[g].x )
            percent_x2 *= -1;
          if ( balls[num].x < balls[g].x )
            percent_x1 += -1;
          if ( balls[num].y > balls[g].y )
            percent_y2 *= -1;
          if ( balls[num].y < balls[g].y )
            percent_y1 += -1;

          // num pixels * proportion of ball * percent of axis
          balls[num].x += pixels_to_move * percent_ball1 * percent_x1;
          balls[num].y += pixels_to_move * percent_ball1 * percent_y1;
          balls[g].x += pixels_to_move * percent_ball2 * percent_x2;
          balls[g].y += pixels_to_move * percent_ball2 * percent_y2;
          
          // exchange all velocities (same as inverting & transferring energy)
          // before swapping velocities, need to check obstacles
          balls[num].vel = { up: up2, left: left2 };
          balls[g].vel = { up: up1, left: left1 };
          balls[num].check_obstacles();
          balls[g].check_obstacles();

          // roll
          if ( Math.abs(balls[num].vel.left) < .2  || Math.abs(balls[g].vel.left) < .2 ) {
            top_ball = ( balls[num].y > balls[g].y ) ? balls[num] : balls[g];
            bot_ball = ( balls[num].y < balls[g].y ) ? balls[num] : balls[g];
            roll_dir = ( top_ball.x <= bot_ball.x ) ? .1 : -.1;
            top_ball.vel.left += ( GRAVITY * roll_dir);
            bot_ball.vel.left -= ( GRAVITY * roll_dir);
          }
        }
      }
    }
  }


  return {
    start: function(){
      init();
      timer = setInterval( function(){ main_loop(); }, BALL_SPEED);
    },
    stop: function(){
      clearInterval(timer);
      cells = document.getElementsByTagName("div");
      $('.ball, .obj').remove();
    }
  }

})();