
function SObject(x, y,height,width)
{
this.x = x;
this.y = y;
this.height = height;
this.width = width;
}

function init_balls()
{
document.write('<div id="ob1">  </div>');
document.write('<div id="ob2">  </div>');
document.write('<div id="ob3">  </div>');
document.write('<div id="ob4">  </div>');
document.write('<div id="ob5">  </div>');
document.write('<div id="ob6">  </div>');
document.write('<div id="ob7">  </div>');
document.write('<div id="ob8">  </div>');

numobjects = 7;
ObjectsArray = new Array(numobjects);
for (var t=0;t<numobjects;t++)
    {
    objectname="ob" + (t+1);
    x=parseInt(getStyle(document.getElementById(objectname),"left"));
    y=parseInt(getStyle(document.getElementById(objectname),"top"));
    height=parseInt(getStyle(document.getElementById(objectname),"height"));
    width=parseInt(getStyle(document.getElementById(objectname),"width"));
    ObjectsArray[t] = new SObject(x,y,height,width);
    }

get_window_size();
if (document_special_size==0)
    start_bottom = document_height - 35;
    else
    start_bottom = document_special_size-5;

ObjectsArray[4].y = start_bottom+1;
ball_speed=50;

get_window_size();
repeats=0;
border_top=0;
border_bot=document_height+50;
border_left=10;
border_right=document_width-25;
num_of_balls=150;

ball_x = new Array(num_of_balls);
ball_y = new Array(num_of_balls);
ball_oldx = new Array(num_of_balls);
ball_oldy = new Array(num_of_balls);
ball_velocity_up = new Array(num_of_balls);         // negative numbers move down, positive numbers move up
ball_velocity_left = new Array(num_of_balls);       // negative numbers move left, positive numbers move right
ball_start = new Array(num_of_balls);
ball_keep_alive = new Array(num_of_balls);

gravcounter = 0; // to count the # of itetions w/ inverse gravity
gravity=2.5;
friction=.2;
ball_timer=0;

// Initialize Balls
for (var t=0;t<num_of_balls;t++)
   {
   ball_keep_alive[t]=0; // they are still onscreen
   document.write("<div id='ball"+t+"' class='ball'><img id='ball"+t+"img' src=images/balla.gif></div>");
   document.getElementById("ball"+t).style.visibility="hidden";
   }

reset_balls();
}

function reset_balls()
{
// Re-initializes all balls, starting from bottom and top, randomized velocities

for (var t=0;t<num_of_balls;t++)
   {
   if (ball_keep_alive[t]==0) // only reset balls that have fallen off the screen
     {
     ball_keep_alive[t]=1; // it's now alive
     ball_x[t]= border_right/2 + ((Math.random()*200)-100);  // Middle
     ball_velocity_up[t]=(Math.random()*10);  // 1-10

     ball_velocity_left[t]=(Math.random()*50);  // -5 to 5
     ball_velocity_left[t]-=25; // makes 25 = 0 (so we have left and right velocities)

     if (t<(num_of_balls/2)) // First half of balls, top half of screen
       {
       document.getElementById("ball"+t+"img").src="images/ball.gif";
       ball_y[t]= 15;
       ball_start[t]=Math.floor(Math.random()*300);
       }
       else
       { // second half of balls, middle right of screen
       ball_y[t]=start_bottom/2;   // position halfway up
       ball_x[t]=border_right-15;  // position all the way right
       ball_velocity_left[t]-=25;  // makes them all shoot left faster
       ball_velocity_left[t]*=5;   // make them shoot out faster
       ball_velocity_up[t]*=-5;    // make them spread
       ball_velocity_up[t]-=(ball_velocity_up[t]/2); // aim the spread
       ball_start[t]=40+Math.floor(Math.random()*50);
       }

     ball_velocity_up[t]*=-1; // inverts all velocities

     document.getElementById("ball"+t).style.visibility="hidden";

     set_ball(t);
     }
     else
     ball_start[t]=0;
   }
}

function begin_ball()
{
// primary function for balls
if (gravcounter==0)
    {
    var surprise = Math.floor(Math.random()*1001);

    if (surprise < 2)
        {
        gravity*=-1;
        gravcounter=1;
        }
    }

if (gravity < 0)
    {
    gravcounter++;

    if (gravcounter>100)
        {
        gravcounter=0;
        gravity*=-1;
        }
    }

for (var t=0;t<num_of_balls;t++)
   {
   // check if their internal timer is ready for display

   if (ball_start[t]<ball_timer)
       {
       document.getElementById("ball"+t).style.visibility="visible";
       animate_ball(t);
       }
   }

ball_timer++;

if (ball_timer<200) // do nothing
   setTimeout("begin_ball()",ball_speed);

   else
   {
   ball_timer=0;
   repeats++; // counter for gap in between resets
   if (repeats==2)
      {
      repeats=0;
      for (t=0;t<num_of_balls;t++)
         if (ball_keep_alive[t]==1)  // motion to remove stagnant balls
              {
              ball_velocity_left[t]=(Math.random()*50)-25;
              }
      }
   reset_balls();

   setTimeout("begin_ball()",ball_speed);
   }
}

function animate_ball(num)
{
// controls motion of ball

ball_oldx[num]=ball_x[num];
ball_oldy[num]=ball_y[num];

ball_x[num]-=ball_velocity_left[num];
ball_y[num]-=ball_velocity_up[num];
ball_velocity_up[num]-=gravity;

// left right friction
if (ball_velocity_left[num]>0)
   ball_velocity_left[num]-=friction;
   else
   ball_velocity_left[num]+=friction;

// bounce off of borders
if (ball_x[num]<border_left)
  {
  ball_velocity_left[num]*=-1;
  ball_velocity_left[num]/=2;
  ball_x[num]=border_left+1;
  }
if (ball_x[num]+15>border_right)
  {
  ball_velocity_left[num]*=-1;
  ball_velocity_left[num]/=2;
  ball_x[num]=border_right-15-1;
  }

if (ball_y[num]+15>border_bot)
   { // falls off screen
   ball_velocity_up[num]=0;
   ball_velocity_left[num]=0;
   ball_y[num]=border_bot+15;
   document.getElementById("ball"+num).style.visibility="hidden";
   ball_keep_alive[num]=0;    // it fell off, so let it go
   }

if (ball_y[num]<border_top)
   {
   ball_velocity_up[num]*=-1;
   ball_velocity_up[num]/=2;
   ball_y[num]=border_top+1;
   }

// Check collisions

// (To be more thorough, this loop could reset everytime there
//  is a collision until no collisions happen)
//  This of course would take a very long time

collision_detect(num);

// Check the obstacles
for (var t=0; t<numobjects; t++)
   {
   if (obstacles(ObjectsArray[t],num)==5)
      {
      t--;
      }
   }

set_ball(num);
}

function make_positive(ovar)
{
if (ovar<0)
    {
    ovar*=-1;
    }

return ovar;
}

function collision_detect(num)
{
for (var g=0;g<num_of_balls;g++)
    {
    if ((g!=num)&&(ball_keep_alive[g]!=0))
       // don't scan self or inactives
        {
        var xdistance = ball_x[g]-ball_x[num];
        var ydistance = ball_y[g]-ball_y[num];
        var hypo_distance = (xdistance*xdistance)+(ydistance*ydistance);
        distance_result = parseInt(Math.sqrt(hypo_distance));

        if ((distance_result>=-16)&&(distance_result<=16))
            {
            // store current velocities
            var up1=ball_velocity_up[num];
            var left1=ball_velocity_left[num];
            var up2=ball_velocity_up[g];
            var left2=ball_velocity_left[g];

            // stop the collision (move the balls back, proportionately along both velocities)

            // proportions each axis needs to move
            var total_ball1 = make_positive(up1) + make_positive(left1);
            var percent_x1 = make_positive(left1) / total_ball1;
            var percent_y1 = make_positive(up1) / total_ball1;
            var total_ball2 = make_positive(up2) + make_positive(left2);
            var percent_x2 = make_positive(left2) / total_ball2;
            var percent_y2 = make_positive(up2) / total_ball2;

            // proportions each ball needs to move
            var pixels_to_move = 15-make_positive(distance_result);  // total pixels to move
            var percent_ball1 = total_ball1 / (total_ball1+total_ball2);
            var percent_ball2 = total_ball2 / (total_ball1+total_ball2);

            // Translate reflections
            if (ball_x[num]>ball_x[g])
                {
                percent_x2*=-1;
                }
            if (ball_x[num]<ball_x[g])
                {
                percent_x1+=-1;
                }
            if (ball_y[num]>ball_y[g])
                {
                percent_y2*=-1;
                }
            if (ball_y[num]<ball_y[g])
                {
                percent_y1+=-1;
                }

            // num pixels * proportion of ball * percent of axis
            ball_x[num]+= pixels_to_move*percent_ball1*percent_x1;
            ball_y[num]+= pixels_to_move*percent_ball1*percent_y1;
            ball_x[g]+= pixels_to_move*percent_ball2*percent_x2;
            ball_y[g]+= pixels_to_move*percent_ball2*percent_y2;

            var nohits=0

           // exchange all velocities (same as inverting & transferring energy)
           // before swapping velocities, need to check obstacles
            for (var t=0; t<numobjects; t++)
               {
               if (obstacles(ObjectsArray[t],num)==5)
                  {
                  t--;
                  nohits=1
                  }
               }
            if (nohits==0)
                {
                    ball_velocity_up[num]=up2;
                    ball_velocity_left[num]=left2;
                }
            nohits = 0

            for (var t=0; t<numobjects; t++)
               {
               if (obstacles(ObjectsArray[t],g)==5)
                  {
                  t--;
                  nohits=1
                  }
               }
            if (nohits==0)
                {
                    ball_velocity_up[g]=up1;
                    ball_velocity_left[g]=left1;
                }

            // roll
            if (make_positive(ball_velocity_left[num]) < .1)
                {

                // num is on top of g
                if (ball_y[num]<ball_y[g])
                    {
                    if ((ball_x[num]+7)>=(ball_x[g]+7))
                         {
                         ball_velocity_left[num]+=.2;
                         ball_velocity_left[g]-=.2;
                         }
                         else
                         {
                         ball_velocity_left[num]-=.2;
                         ball_velocity_left[g]+=.2;
                         }
                    }
                }
            }
        }
    }
}
function obstacles(el,num)
{

// First check the bottom of el for hit from below
if ((ball_oldy[num]>= el.y+el.height) && (ball_y[num]<=el.y+el.height))
    {
    if ((ball_x[num]+15>=el.x)&&(ball_x[num]<=el.x+el.width))
        {
	    ball_velocity_up[num]*=-1;
        ball_velocity_up[num]/=2;

        // escape velocity
        if ((gravity<0)&&(ball_velocity_up[num] >= (gravity*2)))
            {
            ball_velocity_up[num] = 0;
            }

        ball_oldy[num]=ball_y[num]+15;
        ball_y[num]=el.y+el.height+1;
        return 5;
        }
    }

//  Second check the top el for hit from above
if ((ball_oldy[num]+15 <= el.y) && (ball_y[num]+15>=el.y))
    {
    if ((ball_x[num]+15>=el.x)&&(ball_x[num]<=el.x+el.width))
        {
  	    ball_velocity_up[num]*=-1;
        ball_velocity_up[num]/=2;

        // check escape velocity
        if (ball_velocity_up[num] <= (gravity * 2))
              {
              ball_velocity_up[num] = 0;
              }

        ball_oldy[num]=ball_y[num]-15;
        ball_y[num]=el.y-15-1;

        return 5;
        }
    }


// check side hits
if ((ball_y[num]+15>=el.y)&&(ball_y[num]<=el.y+el.height))
    {
    // right side collision for hit from the left
    if ((ball_oldx[num] > el.x+el.width) && (ball_x[num] <= el.x+el.width))
        {
        ball_velocity_left[num]*=-1;
        ball_velocity_left[num]/=2;
        ball_oldx[num]=ball_x[num];
        ball_x[num]=el.x+el.width;
        return 5;
        }
    // left collision for hit from the right
    if ((ball_oldx[num]+15 < el.x) && (ball_x[num]+15 >= el.x))
        {
        ball_velocity_left[num]*=-1;
        ball_velocity_left[num]/=2;
        ball_oldx[num]=ball_x[num];
        ball_x[num]=el.x-15;
        return 5;
        }
    }

  return 0;
}


function set_ball(num)
{
// move the texture for the ball
document.getElementById("ball"+num).style.top=ball_y[num]+"px";
document.getElementById("ball"+num).style.left=ball_x[num]+"px";
}



