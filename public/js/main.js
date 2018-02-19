

//      jquery 
$(document).ready(function () {
    topWindow();
    //back to top fade in on scroll
    $(window).scroll(function () {
        $("#back-to-top").fadeTo("slow", 1);
    });


    // // move the beer circular left and right
    var clicknum = 1,
        direction;
    $(".beer-wrapper-box").click(function () {
        direction = clicknum % 2;// move left or right
        if (direction == 1) {
            var div = $(this);
            div.find(".beermoveleft").animate({
                left: '-1500px'
            }, "slow");


            div.find(".beermoveright").animate({
                left: '1500px'
            }, "slow");

            clicknum++;

        } else {
            var div = $(this);
            div.find(".beermoveleft").animate({
                left: '00px'
            }, "slow");

            div.find(".beermoveright").animate({
                left: '0px'
            }, "slow");
            clicknum++;

        }
    });


    // // when click on back to top btn 
    $("#back-to-top").click(function () {
        window.scrollTo(0, 0);
    });

    // close the model
    $(".close").click(function () {

        $("#myModal").css("display", "none");
    });

    // open a pop up  after clicking the Blog BTN
    $("#pay").click(function () {
        $("#myModal").css("display", "block");

    });

});

//slideshow
el = document.getElementById("simple-ss");

function links() {
    left = parseInt(getComputedStyle(el).getPropertyValue("background-position").split(" ", 1));
}


//angular
var app = angular.module("myApp", ["ngRoute"]);


app.controller('formCtrl', ['$scope', function ($scope) {
    
    $scope.orderForm = {};

}]);



//this is the function that make the div fade in everyone when RollPossition gets to certaine number

var RollPossition = 0;
window.onscroll = function () {
    myFunction()
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
            document.getElementById("Emailaddress").innerHTML = "<h1>Oops!</h1><p> you need to enter your Email</p> ";
        } else {
            document.getElementById("Emailaddress").innerHTML = " <h1>Thank You !</h1><p>an Email will be sent to this Email address </p>" + firstEmail;

        }
    } else {
        if (firstEmail == 0 || SecEmail == 0) {

            document.getElementById("Emailaddress").innerHTML = "<h1>Thank You !</h1><p>an Email will be sent to this Email address </p>" + Finalemail;
        } else {
            document.getElementById("Emailaddress").innerHTML = "<h1>Oops!</h1><p> Only One Email Address</p> ";
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