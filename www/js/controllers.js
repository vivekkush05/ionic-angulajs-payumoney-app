angular.module('starter.controllers', [])

	.controller('AppCtrl', function ($scope, $ionicModal, $timeout, $ionicSideMenuDelegate, $rootScope, $ionicHistory, $state, $ionicPopup, $ionicLoading, webstreaks, $ionicPlatform, Toast) {
		// Form data for the login modal
		if (window.localStorage.getItem("UserInfo")) {
			$rootScope.loginv = JSON.parse(window.localStorage.getItem("UserInfo"));
			$rootScope.loginData = {
				mobile	  	:		$rootScope.loginv.mobile,
				password	:	$rootScope.loginv.password,
				usertype    :	$rootScope.loginv.usertype,
				kyc_done    :	$rootScope.loginv.kyc_done,
				username    :	$rootScope.loginv.username,
				token	   	:	$rootScope.loginv.token,
				profile_img :    $rootScope.loginv.profile_img,
				email       :    $rootScope.loginv.email,
				dob	     	:	$rootScope.loginv.dob,
				walletamount:	$rootScope.loginv.walletamount,
			
			};
			$rootScope.userIsLoggedIn = true;
		} else {
			$rootScope.loginData = {
				mobile	  :	'',
				password	:	'',
				usertype    :	'',
				kyc_done    :	'',
				username    :	'',
				token	   :	'',
				profile_img :    '',
				email       :    '',
				dob	     :	'',
				walletamount:	0,
			
			};
			$rootScope.userIsLoggedIn = false;
		}
		console.log($rootScope.loginData);

		$rootScope.kyc = {
			name: $rootScope.loginData.name,
		}

		window.localStorage.setItem("mainurl", "http://mcampus.rnfiservices.in/campuspayment/api/v1/");
		$rootScope.mainURL = window.localStorage.getItem("mainurl");

		$rootScope.user = {
			otp 			 : '',
			password		: '',
			confirmPassword : '',
		}
		
		$rootScope.userOTP = '';
		$rootScope.userPassword = '';
		


		
		$rootScope.centers = {};
		$rootScope.membershipDetails = {};
		$rootScope.couponDetail = {
			code: '',
		};
		$rootScope.noDataFound = true;


		$rootScope.showAlert = function (title, message) {
			var alertPopup = $ionicPopup.alert({
				title: title,
				template: message,
				okType: 'button-dark theme-color'
			});
		};

		/*FAIL POPUP AND EXIT APPLICATION CONFIRMATION*/
		$rootScope.showPopup = function () {
			$ionicLoading.hide();
			$ionicPopup.alert({
				template: 'Please check your connection to the internet!',
				title: 'Connectivity Error!',
				okType: 'button-dark theme-color'
			});
		};
		// COMMON FUNCTIONS
		//Two parameters: 1.root(true or false) 2.state(state i want to navigate)
		$rootScope.navigateTo = function (root, state) {
			console.log("Starting navigation process...");
			$ionicSideMenuDelegate.toggleLeft(false);
			$ionicSideMenuDelegate.toggleRight(false);

			console.log("currentStateName: ", $ionicHistory.currentStateName());
			console.log("Checking if root parameter is true: ", root);
			if (root) {
				$ionicHistory.nextViewOptions({
					historyRoot: true,
					disableBack: true
				});
			}
			console.log("Navigating to :", state);
			$state.go(state, {}, { reload: true });
		};


		// Perform the login action when the user submits the login form
		$scope.doLogin = function () {
			console.log('Doing login', $rootScope.loginData);

			$ionicLoading.show();

			var cdnResource = 	"login/login";
			var cdnData 	=	'mobile='+$rootScope.loginData.mobile+'&password='+$rootScope.loginData.password;



			webstreaks.post(cdnResource, cdnData)
				.success(function (res) {
					console.log(res);
					if (res.status) {
						$rootScope.loginData = {
							mobile	 	:	$rootScope.loginData.mobile,
							password	:	$rootScope.loginData.password,
							usertype    :	res.response.usertype,
							kyc_done    :	res.response.kyc_done,
							username    :	res.response.username,
							token	   	:	res.response.token,
							profile_img :    res.response.profile_img,
							email       :    res.response.email,
							dob	     	:	res.response.dob,
							walletamount:	res.response.walletamount,
			
						};

						console.log(res.response);
						$ionicLoading.hide();
						$scope.doLoginValidate();

					} else {
						$ionicLoading.hide();
						$rootScope.showAlert('Error', res.response);
						$rootScope.userIsLoggedIn = false;
						//$rootScope.navigateTo(true, 'app.preloading');
					}
				}).error(function (err) {
					console.log("Error on getting Details : ", err);
					//$rootScope.showAlert('Error','Error on getting Details');
					$ionicLoading.hide();
				});
		};

		$scope.doLoginValidate = function () {
			console.log('Login', $rootScope.loginData);
			window.localStorage.setItem("UserInfo", JSON.stringify($rootScope.loginData));
			$ionicHistory.nextViewOptions({
				historyRoot: true,
				disableBack: true
			});
			$rootScope.userIsLoggedIn = true;
			$rootScope.startApplication();
			$rootScope.navigateTo(true, 'app.dashboard');
		};

		$rootScope.logout = function () {
			$ionicLoading.show();
			window.localStorage.removeItem("UserInfo");
			$rootScope.loginData = {
				id: '',
				username: '',
				password: '',
				name: '',
				center: '',
				status: '',
				centers: '',
			}
			$ionicSideMenuDelegate.toggleLeft();
			$rootScope.userIsLoggedIn = false;
			$ionicHistory.nextViewOptions({
				historyRoot: true,
				disableBack: true
			});
			Toast.show('You have logged out succesfully', "center");
			$rootScope.navigateTo(true, 'app.login');
		};



		$rootScope.fetchwalletBalance = function(){
			$ionicLoading.show();		
	
			var cdnResource = 	"wallet/confirm/moneydetail";
			var cdnData 	=	'token='+$rootScope.loginData.token;
			
			webstreaks.post(cdnResource, cdnData)
			.success(function(res) {
				if(res.status){
					$rootScope.wallet = res.response;
					console.log($rootScope.wallet);
				}else{
					$rootScope.showAlert('Error','Error Occured While fetching the categories.');
				}
				$ionicLoading.hide();
			}).error(function(err) {
				console.log("Error on getting Details : ", err);
				$rootScope.showAlert('Error','Error on getting Details');
				$ionicLoading.hide();
			});
		}

		
		$rootScope.navigateToProduct = function (state, product) {
			console.log("Starting navigation process...");
			$ionicSideMenuDelegate.toggleLeft(false);
			$ionicSideMenuDelegate.toggleRight(false);

			$rootScope.shopProductDetail = product;

			console.log("currentStateName: ", $ionicHistory.currentStateName());
			console.log("Product : ", $rootScope.shopProductDetail);
			console.log("Navigating to Product :", state);
			$state.go(state, { productId: product.id }, { reload: true });
		};


		

		$rootScope.startApplication = function () {
			$rootScope.fetchwalletBalance();
			$rootScope.navigateTo(true, 'app.dashboard');
		}

		$ionicPlatform.ready(function () {
			if ($rootScope.userIsLoggedIn) {
				$rootScope.startApplication();
			} else {
				$rootScope.navigateTo(true, 'app.login');
			}
		});

	})
	.controller('loginCtrl', function ($scope, $ionicSideMenuDelegate, $rootScope, $ionicLoading) {
		$ionicSideMenuDelegate.canDragContent(false);
	})
	.controller('dashboardCtrl', function ($scope, $ionicSideMenuDelegate, $rootScope, $cordovaCamera, $cordovaFile, $cordovaFileTransfer, $cordovaDevice, $ionicPopup, $cordovaActionSheet, $ionicLoading, webstreaks) {
		$ionicSideMenuDelegate.canDragContent(true);
		$scope.mainSlideshow = [
			{ thumb: "img/banner/membership.jpg", img: 'img/banner/bg/3.jpg', link: 'app.membership' },
			{ thumb: "img/banner/4.jpg", img: 'img/banner/bg/1.jpg', link: 'app.redeem' },
		];
		$scope.galleryOptions = {
			pagination: '.swiper-pagination',
			slidesPerView: 1,
			freeMode: false,
			//nextButton: '.swiper-button-next',
			//prevButton: '.swiper-button-prev',
			paginationClickable: false,
			centeredSlides: true,
			spaceBetween: 0,
		};

		$scope.galleryOptions2 = {
			pagination: '.swiper-pagination',
			slidesPerView: 1.5,
			freeMode: false,
			//nextButton: '.swiper-button-next',
			//prevButton: '.swiper-button-prev',
			paginationClickable: false,
			centeredSlides: true,
			spaceBetween: 20,
		};

	})
	.controller('kycCtrl', function ($scope, $ionicSideMenuDelegate, $rootScope, $filter, ionicDatePicker,$ionicLoading,webstreaks,Toast, $cordovaInAppBrowser,$ionicPopup) {
		$ionicSideMenuDelegate.canDragContent(true);

		$scope.kyclist = [];
		var pageIndex = 1;
		$rootScope.noDataFound = false;
		$rootScope.noloadDataFound	= false;

		$rootScope.isValid = false;
		$rootScope.loadMoney = {
		amount : '',
	}
	
	$rootScope.selectMoney = function(amt){
		$rootScope.loadMoney.amount = amt;
	}
	
	/*$rootScope.loadwalletamount = function(){
			console.log($rootScope.loginData.token);
			console.log($rootScope.loadMoney.amount);
			
			
			$ionicLoading.show();
			var cdnResource = 	"wallet/confirm/loadwalletmoney";
			var cdnData 	=	'token='+$rootScope.loginData.token+'&amount='+$rootScope.loadMoney.amount;
			
			webstreaks.post(cdnResource, cdnData)
			.success(function(res) {
				if(res.status){
					console.log(res);
					$rootScope.showAlert('Success',res.message);
					$rootScope.fetchwalletBalance();
					$rootScope.loadMoney = {
						amount : '',
					}
				}else{
					$rootScope.showAlert('Error',res.message);
				}
				$ionicLoading.hide();
			}).error(function(err) {
				console.log("Error on getting Details : ", err);
				$rootScope.showAlert('Error','Error on getting Details');
				$ionicLoading.hide();
			});
		
	}
	*/

	$scope.payWithPayMoney = function() {
		var options = {
		  location: 'yes',
		  clearcache: 'yes',
		  toolbar: 'no',
		  closebuttoncaption:'back'
		};
		 var close;
		var closeLoop;
		var amt = 	10;		//parseInt( $localStorage.totAmount ) + parseInt($localStorage.taxAmount);
		var name =  "vivek Kushwaha";		//$localStorage.loggedUser.firstName + " " + $localStorage.loggedUser.lastName;
		var mobile = "9560620395" 	//$localStorage.loggedUser.custPhoneNumber;
		var email =  "vivekkush05@gmail.com";	//$localStorage.loggedUser.custEmail;
		var bookingId = '111'.concat(Math.floor((Math.random() * 100000) + 1));		//$scope.txnId;
		var productinfo =  "Order for 111";         //"Order for "+ $scope.txnId;
		var salt = "e5iIg1jwi8";
		var key = "rjQUPktU";
		var string = key + '|' + bookingId + '|' + amt+ '|' + productinfo + '|' + name + '|' + email +'|||||||||||'+salt;    
		var encrypttext = sha512(string);
	 
		var url = "payumoney/payuBiz.html?amt="+amt+"&name="+name+"&mobileNo="+mobile+"&email="+email+"&bookingId="+bookingId+"&productinfo="+productinfo+"&hash="+encrypttext+"&salt="+salt+"&key="+key ;
		console.log(url);
		$cordovaInAppBrowser.open(url, '_blank', options)
		  .then(function(event) {
			// success
		  })
		  .catch(function(event) {
			// error
		  });
		//$cordovaInAppBrowser.close();
	  
	 $rootScope.$on('$cordovaInAppBrowser:loadstart', function(e, event){
	  });
	 
	  $rootScope.$on('$cordovaInAppBrowser:loadstop', function(e, event){
		// insert CSS via code / file
		  $cordovaInAppBrowser.executeScript({
			   file: "payumoneyPaymentGateway.js"
		  });
	 
		if(event.url == "http://localhost/success.php") {
				$cordovaInAppBrowser.close();
				$ionicPopup.alert({
					title:'Sucess',
					template:'You payment Successfull!'
				  });
				//cartService.clearCart();
				//$state.go("app.thanksAndHotFix");
		  }
		  if(event.url == "http://localhost/failure.php") {
			$cordovaInAppBrowser.close();
			 $ionicPopup.alert({
					 title:'Something Is Wrong',
					 template:'You payment failed!'
				   });
		  }
	  });
	  
	 
		$rootScope.$on('$cordovaInAppBrowser:loaderror', function(e, event){
			console.log("load error");
		});
	 
		  $rootScope.$on('$cordovaInAppBrowser:exit', function(e, event){
			console.log("inapp exit");  
		});
	  }



	});

