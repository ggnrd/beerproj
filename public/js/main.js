
//      jquery
$(document).ready(function() {
  topWindow();
  //back to top fade in on scroll
  $(window).scroll(function() {
    $("#back-to-top").fadeTo("slow", 1);
  });

  // // move the beer circular left and right
  var clicknum = 1,
    direction;
  $(".beer-wrapper-box").click(function() {
    direction = clicknum % 2; // move left or right
    if (direction == 1) {
      var div = $(this);
      div.find(".beermoveleft").animate(
        {
          left: "-1500px"
        },
        "slow"
      );

      div.find(".beermoveright").animate(
        {
          left: "1500px"
        },
        "slow"
      );

      clicknum++;
    } else {
      var div = $(this);
      div.find(".beermoveleft").animate(
        {
          left: "00px"
        },
        "slow"
      );

      div.find(".beermoveright").animate(
        {
          left: "0px"
        },
        "slow"
      );
      clicknum++;
    }
  });

  // // when click on back to top btn
  $("#back-to-top").click(function() {
    window.scrollTo(0, 0);
  });

  // close the model
  $(".close").click(function() {
    $("#myModal").css("display", "none");
  });

  // open a pop up  after clicking the Blog BTN
  $("#pay").click(function() {
    $("#myModal").css("display", "block");
  });

  // revels the nav div info
  $("#Users").click(function() {
    $("#Usersdip").toggle();
  });
  $("#Blogs").click(function() {
    $("#Blogsdisp").toggle();
  });
  $("#Orders").click(function() {
    $("#Ordersdip").toggle();
  });
  $("#NEW_BLOG").click(function() {
    $("#NEW_BLOGpost").toggle();
  });
});

///////////////////////////////////
// //////////////check///////////////

// // Themes begin
// am4core.useTheme(am4themes_animated);
// // Themes end

// var chart = am4core.create("chartdiv", am4charts.XYChart);

// var data = [];
// var value = 50;
// for (let i = 0; i < 10; i++) {
//   let date = new Date();
//   date.setHours(0, 0, 0, 0);
//   date.setDate(i);
//   value -= Math.round((Math.random() < 0.5 ? 1 : -1) * Math.random() * 10);
//   data.push({ date: date, value: value });
// }

// ///////////////////////////////////////////
// // ///check how to get dat from CHART to table
// // //////////////////////////////////////////
// // document.getElementById("dataDebg").cells[0].innerHTML=data[0].value;

// // document.getElementById("dataDebg").cells[1].innerHTML=data[0].date;
// // ///////////////////////////////////

// chart.data = data;

// // Create axes
// var dateAxis = chart.xAxes.push(new am4charts.DateAxis());
// dateAxis.renderer.minGridDistance = 60;

// var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());

// // Create series
// var series = chart.series.push(new am4charts.LineSeries());
// series.dataFields.valueY = "value";
// series.dataFields.dateX = "date";
// series.tooltipText = "{value}";

// series.tooltip.pointerOrientation = "vertical";

// chart.cursor = new am4charts.XYCursor();
// chart.cursor.snapToSeries = series;
// chart.cursor.xAxis = dateAxis;

// //chart.scrollbarY = new am4core.Scrollbar();
//chart.scrollbarX = new am4core.Scrollbar();
//////////////////////////////////
///////    end check///////////////
//////////////////////////////////

//slideshow
el = document.getElementById("simple-ss");

function links() {
  left = parseInt(
    getComputedStyle(el)
      .getPropertyValue("background-position")
      .split(" ", 1)
  );
}

//angular
var app = angular.module("myApp", ["ngRoute"]);

app.controller("formCtrl", function($scope, $http) {
  $scope.doSignUp = function() {
    document.getElementById("myModal").style.display = "block ";
    console.log("doing sign up");
    $http
      .post("/accounts", {
        order: $scope.orderform
      })
      .then(function(order) {
        console.log(order);
      });
  };
});

//this is the function that make the div fade in everyone when RollPossition gets to certaine number

var RollPossition = 0;
window.onscroll = function() {
  myFunction();
};

function myFunction() {
  RollPossition += 0.2;
  if (RollPossition > 5) {
    document.getElementById("masage").style.opacity = "1";

    if (RollPossition > 9) {
      document.getElementById("Blog").style.opacity = "1";

      if (RollPossition > 13) {
        document.getElementById("beerinfo").style.opacity = "1";
        if (RollPossition > 20) {
          document.getElementById("MakeAnOrder1").style.opacity = "0.9";
        }
      }
    }
  }
}

function CreateTempChart() {
  var data = [];
  var x = document.getElementById("tempTable").rows.length;
  var celCount = 0;
  for (var i = 1; i < x; i++) {
    value = parseInt(
      document.getElementById("tempTable").rows[i].cells[celCount].innerHTML
    );
    date = Date.parse( document.getElementById("tempTable").rows[i].cells[celCount + 1]
      .innerHTML);
    data.push({ date: date, value: value });
  }
  // Themes begin
am4core.useTheme(am4themes_animated);
// Themes end

var chart = am4core.create("chartdiv", am4charts.XYChart);

chart.data = data;

// Create axes
var dateAxis = chart.xAxes.push(new am4charts.DateAxis());
dateAxis.renderer.minGridDistance = 60;

var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());

// Create series
var series = chart.series.push(new am4charts.LineSeries());
series.dataFields.valueY = "value";
series.dataFields.dateX = "date";
series.tooltipText = "{value}";

series.tooltip.pointerOrientation = "vertical";

chart.cursor = new am4charts.XYCursor();
chart.cursor.snapToSeries = series;
chart.cursor.xAxis = dateAxis;
  // date = rowCount.celCount[1].value;
  // window.alert(" date "+date);

  // for (var i = 1; i < rowCount - 1; i++) {
  //   value = rowCount[i].celCount.value;
  //   date = rowCount.celCount[1].value;

  //   data.push({ date: date, value: value });
  // }
  
}
    

// clear flash model
try {setTimeout(document.getElementById("indexSuccess_msg1").style.display="none" ,20000);

  
} catch (error) {
  console.log("do not hav a flash massge");
  
}


// open a pop up  after clicking the Blog BTN
// when click on the blog BTN it takes the Email  and display it on a model
// it check if it has 2 diffrent Email  and display the right masaage

function blogBTN() {
  document.getElementById("myModal").style.display = "block ";

  var firstEmail = document.forms["blogemail"]["Email"].value;
  var SecEmail = document.forms.id.children.Email.value;
  var Finalemail = SecEmail + firstEmail;

  if (firstEmail == SecEmail) {
    if (Finalemail == "") {
      document.getElementById("Emailaddress").innerHTML =
        "<h1>Oops!</h1><p> you need to enter your Email</p> ";
    } else {
      document.getElementById("Emailaddress").innerHTML =
        " <h1>Thank You !</h1><p>an Email will be sent to this Email address </p>" +
        firstEmail;
    }
  } else {
    if (firstEmail == 0 || SecEmail == 0) {
      document.getElementById("Emailaddress").innerHTML =
        "<h1>Thank You !</h1><p>an Email will be sent to this Email address </p>" +
        Finalemail;
    } else {
      document.getElementById("Emailaddress").innerHTML =
        "<h1>Oops!</h1><p> Only One Email Address</p> ";
    }
  }
}

//open the model after click the CheckOut BTN
function CheckOut() {
  document.getElementById("myModal").style.display = "block ";
}

function SingUpPop() {
  var popup = document.getElementById("myPopup");
  popup.classList.toggle("show");
}

function topWindow() {
  window.scrollTo(0, 0);
}
function reloadPage() {
  location.reload();
}

function ShowPopUp() {
  document.getElementById("myModal").style.display = "block ";

  document.getElementById("Emailaddress").innerHTML =
  "<h1>Oops!</h1><p> you are not loggef in ...</p> ";
  document.getElementById("text").style.display = "block ";
 
  //document.getElementById("myModal").style.display = "block ";

  //document.getElementById("Emailaddress").innerHTML ="<h1>Oops!</h1> <p> you are not singed in ...\n   <a href="+register+">register</a>  <a href="+login+">sing in</a> </p>";
  
}