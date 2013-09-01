Balls = (function(){
  BALL_HEIGHT = 15; // Size of a ball
  COLLISION = 5; // Flag for collision
  GRAVITY = 1; // Gravity constant, never changes
  grav_counter = 0;
  FRICTION = .05;
  tick_counter = 0; // Counter for ball
  NUM_OBJECTS = 5;
  BALL_SPEED = 30; // Speed of animation
  NUM_OF_BALLS = 50;
  balls = null;
  objects = null;
  timer = null; // Timer object
  START_BOTTOM = window.innerHeight - 35;
  BORDER_TOP = 0;
  BORDER_BOT = window.innerHeight + 50;
  BORDER_LEFT = BALL_HEIGHT / 2;
  BORDER_RIGHT = window.innerWidth - 25;

  function SObject( id ) {
    this.id = "ob" + id;
    this.el = $('<div/>', { 'id': this.id, 'class': 'obj' });
    if ( id == 0 )
      this.el.offset({ top: START_BOTTOM + 1 });
    $('body').append( this.el );

    this.x = this.el.offset().left;
    this.y = this.el.offset().top;
    this.height = this.el.height();
    this.width = this.el.width();
  }


  function Ball( id ){
    this.id = "ball" + id;
    this.x = 0;
    this.y = BORDER_TOP;
    this.old_x = 0;
    this.old_y = 0;
    this.vel_up = 0;
    this.vel_left = 0;
    this.ball_start = 0;
    this.alive = false;

    c = ( id > NUM_OF_BALLS / 2 ) ? "ball yellow" : "ball";
    this.el = $('<div />', { 'id': this.id, 'class': c });
    $('body').append( this.el );
  }
  Ball.prototype.show = function(){
    this.el.show();
  };
  Ball.prototype.hide = function(){
    this.el.hide();
  };
  Ball.prototype.animate = function(){
    $('#' + this.id).offset({ top: this.y, left: this.x });
  };
  Ball.prototype.move = function(){
    this.old_x = this.x;
    this.old_y = this.y;
    this.vel_up -= GRAVITY;
    if ( Math.abs(this.vel_left) >= FRICTION )
      this.vel_left += ( this.vel_left > 0 ) ? FRICTION * -1 : FRICTION;
    else
      this.vel_left = 0;
    this.x -= this.vel_left;
    this.y -= this.vel_up;
  };
  Ball.prototype.bounce_y = function(){
    if ( Math.abs(this.vel_up) <= GRAVITY )
      this.vel_up = 0;
    else
      this.vel_up *= -.5;
  };

  function init() {

    objects = new Array(NUM_OBJECTS);
    for (var t = 0; t < NUM_OBJECTS; t++)
      objects[t] = new SObject( t );

    // Initialize Balls
    balls = new Array(NUM_OF_BALLS);
    for ( t = 0; t < NUM_OF_BALLS; t++ ) 
      balls[t] = new Ball( t );

    init_balls();
  }

  // Re-initializes all balls, starting from bottom and top, randomized velocities
  function init_balls() {
    for (var t = 0; t < NUM_OF_BALLS; t++) {
      balls[t].hide();

      // only reset balls that have fallen off the screen
      if ( !balls[t].alive ) {
        balls[t].alive = true;
        balls[t].x = BORDER_RIGHT / 2 + ((Math.random()*200)-100);  // Middle
        balls[t].vel_up = (Math.random()*10) * -1;  // 1-10
        balls[t].vel_left = (Math.random()*50) - 25;  // -25 to 25

        // First half of balls, top half of screen 
        if ( t < (NUM_OF_BALLS/2) ) {
          balls[t].y = BORDER_TOP;
          balls[t].ball_start = Math.floor(Math.random()*300);
        } else { 
        // second half of balls, middle right of screen
          balls[t].y = START_BOTTOM / 2;   // position halfway up
          balls[t].x = BORDER_RIGHT - BALL_HEIGHT;  // position all the way right
          balls[t].vel_left -= 25;  // all shoot left
          balls[t].vel_left *= 4;   // shoot faster
          balls[t].vel_up *= -2.5;  // spread
          balls[t].ball_start = 40 + Math.floor(Math.random()*50);
        }
      balls[t].animate();
      } else {
        // motion to remove stagnant balls
        balls[t].vel_left = Math.random() * -50;
      }
    }
  }

  // primary function for balls
  function animate_balls() {
    if ( GRAVITY > 0 ) {
      if ( Math.floor(Math.random()*1001) < 2 ) {
        grav_counter = 0;
        GRAVITY *= -1;
      }
    } else {
      if ( grav_counter++ > 200 ) {
        GRAVITY *= -1;
      }
    }


    for (var t = 0; t < NUM_OF_BALLS; t++) {
      // check if their internal timer is ready for display
      if ( balls[t].ball_start == 0 ) {
        balls[t].show();
        animate_ball(t);
      } else {
        balls[t].ball_start--;
      }
    }

    // Every 200 ticks fling balls off screen
    if ( tick_counter++ > 200 ) {
      tick_counter = 0;
      init_balls();
    }
  }

  // controls motion of ball
  function animate_ball(num) {

    balls[num].move();

    // bounce off of borders
    if ( balls[num].x < BORDER_LEFT ) {
      balls[num].vel_left *= -.5;
      balls[num].x = BORDER_LEFT + 1;
    }
    if ( balls[num].x + BALL_HEIGHT > BORDER_RIGHT ) {
      balls[num].vel_left *= -.5;
      balls[num].x = BORDER_RIGHT - BALL_HEIGHT - 1;
    }

    // falls off screen
    if ( balls[num].y + BALL_HEIGHT > BORDER_BOT ) {
      balls[num].vel_up = 0;
      balls[num].vel_left = 0;
      balls[num].y = BORDER_BOT + BALL_HEIGHT;
      balls[num].hide();
      balls[num].alive = false;
    }

    if ( balls[num].y < BORDER_TOP ) {
      balls[num].vel_up *= -.5;
      balls[num].y = BORDER_TOP + 1;
    }

    // Check the obstacles
    for ( var t = 0; t < NUM_OBJECTS; t++ )
      if ( obstacles(objects[t], num) == COLLISION )
        t--;
    // Check collisions
    collision_detect(num);
 
    balls[num].animate();
  }

  function collision_detect(num) {
    for (var g = 0; g < NUM_OF_BALLS; g++) {
      // don't scan self or inactives
      if ((g != num) && (balls[g].alive)) {
        var x_distance = balls[g].x - balls[num].x;
        var y_distance = balls[g].y - balls[num].y;
        var distance = parseInt( Math.sqrt( Math.pow( x_distance, 2 ) + Math.pow( y_distance, 2 ) ) );

        if ( (distance >= -BALL_HEIGHT - 1) && (distance <= BALL_HEIGHT + 1) ) {
          // store current velocities
          var up1 = balls[num].vel_up;
          var left1 = balls[num].vel_left;
          var up2 = balls[g].vel_up;
          var left2 = balls[g].vel_left;

          // stop the collision (move the balls back, proportionately along both velocities)

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
          for ( t = 0; t < NUM_OBJECTS; t++ )
            if ( obstacles(objects[t], num) == 5 ) 
              t--;
          balls[num].vel_up = up2;
          balls[num].vel_left = left2;

          for ( t=0; t < NUM_OBJECTS; t++ )
            if ( obstacles(objects[t], g) == 5 )
              t--;
          balls[g].vel_up = up1;
          balls[g].vel_left = left1;

          // roll
          if ( Math.abs(balls[num].vel_left) < .1 ) {
            // num is on top of g
            if ( balls[num].y < balls[g].y ) {
              mod = (( balls[num].x + 7 ) >= ( balls[g].x + 7 )) ? 1 : -1;
              balls[num].vel_left += (.2 * mod);
              balls[g].vel_left -= (.2 * mod);
            }
          }
        }
      }
    }
  }

  function obstacles(el, num) {
    // First check the bottom of el for hit from below
    if (( balls[num].old_y >= el.y + el.height ) && ( balls[num].y <= el.y+el.height )) {
      if (( balls[num].x + BALL_HEIGHT >= el.x ) && ( balls[num].x[num] <= el.x + el.width )) {

        balls[num].bounce_y();
        balls[num].old_y = balls[num].y + BALL_HEIGHT;
        balls[num].y = el.y + el.height + 1;
        return COLLISION;
      }
    }

    //  Second check the top el for hit from above
    if (( balls[num].old_y + BALL_HEIGHT <= el.y ) && ( balls[num].y + BALL_HEIGHT >= el.y )) {
      if (( balls[num].x + BALL_HEIGHT >= el.x ) && ( balls[num].x <= el.x + el.width )) {

        balls[num].bounce_y();
        balls[num].old_y = balls[num].y - BALL_HEIGHT;
        balls[num].y = el.y - BALL_HEIGHT - 1;

        return COLLISION;
      }
    }


    // check side hits
    if (( balls[num].y + BALL_HEIGHT >= el.y ) && ( balls[num].y <= el.y + el.height )) {
      // right side collision for hit from the left
      if (( balls[num].old_x > el.x + el.width ) && ( balls[num].x <= el.x + el.width )) {
        balls[num].vel_left *= -.5;
        balls[num].old_x = balls[num].x;
        balls[num].x = el.x + el.width;
        return COLLISION;
      }
      // left collision for hit from the right
      if (( balls[num].old_x + BALL_HEIGHT < el.x ) && ( balls[num].x + BALL_HEIGHT >= el.x )) {
        balls[num].vel_left *= -.5;
        balls[num].old_x = balls[num].x;
        balls[num].x = el.x - BALL_HEIGHT;
        return COLLISION;
      }
    }

    return 0;
  }
  
  return {
    start: function(){
      init();
      timer = setInterval( function(){ animate_balls(); }, BALL_SPEED);
    },
    stop: function(){
      clearInterval(timer);
      cells = document.getElementsByTagName("div");
      $('.ball, .obj').remove();
    }
  }

})();