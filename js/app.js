(function(){
	Parse.initialize("v8DTCX6el0KpoORBh9oZwEMZ5o0sPym5u7teQDoi","4yekpo4ziV95RxXuRcK5fR2ktFuF7PqsZWjj0pDW");
	var e={};
	["loginView","evaluationView","updateSuccessView"].forEach(function(t){
		templateCode=document.getElementById(t).text;
		e[t]=doT.template(templateCode) 
		// 編譯在HTML裡的版型    
	});
	var t={
		loginRequiredView:function(e){
			return function(){
				var t=Parse.User.current();
				if(t){
					e()
					// if 登入了->重新導向到首頁
				}else{
					window.location.hash="login/"+window.location.hash
				}
			}
		}
	};
	var n={
		navbar:function(){
			// 根據使用者登入與否顯示navbar內容
			// 如果使用者有登入的話，Parse.User.current()會回傳現今登入的使用者物件
			var e=Parse.User.current();
			if(e){
				document.getElementById("loginButton").style.display="none";
				document.getElementById("logoutButton").style.display="block";
				document.getElementById("evaluationButton").style.display="block"
			}else{
				document.getElementById("loginButton").style.display="block";
				document.getElementById("logoutButton").style.display="none";
				document.getElementById("evaluationButton").style.display="none"
			}
			document.getElementById("logoutButton").addEventListener("click",function(){
				Parse.User.logOut();
				n.navbar();
				window.location.hash="login/"
			})
		},
		evaluationView:t.loginRequiredView(function(){
			
			var t=Parse.Object.extend("Evaluation");
			var n=Parse.User.current();
			var r=new Parse.ACL;
			//設定權限，只有成功登入可以讀寫
			r.setPublicReadAccess(false);
			r.setPublicWriteAccess(false);
			r.setReadAccess(n,true);
			r.setWriteAccess(n,true);
			var i=new Parse.Query(t);
			i.equalTo("user",n);
			// 表單內容建置
			i.first(
				{
					success:function(i){
					window.EVAL=i;
					if(i===undefined){
						var s=TAHelp.getMemberlistOf(n.get("username")).filter(function(e){
							return e.StudentId!==n.get("username")?true:false
						}).map(function(e){
							e.scores=["0","0","0","0"];
							return e})
					}else{
						var s=i.toJSON().evaluations
					}
					document.getElementById("content").innerHTML=e.evaluationView(s);
					document.getElementById("evaluationForm-submit").value=i===undefined?"送出表單":"修改表單";
					document.getElementById("evaluationForm").addEventListener("submit",function(){
						for(var o=0;o<s.length;o++){
							for(var u=0;u<s[o].scores.length;u++){
								var a=document.getElementById("stu"+s[o].StudentId+"-q"+u);
								var f=a.options[a.selectedIndex].value;
								s[o].scores[u]=f
							}
						}
						if(i===undefined){
							i=new t;
							i.set("user",n);
							i.setACL(r)
						}
						console.log(s);
						i.set("evaluations",s);
						i.save(null,
							{
							    success:function(){
								document.getElementById("content").innerHTML=e.updateSuccessView()
							},
							    error:function(){}})},false)
				    },
				    error:function(e,t){}
			    })
		}),
    loginView:function(t){
			var r=function(e){
				var t=document.getElementById(e).value;
				return TAHelp.getMemberlistOf(t)===false?false:true};
				var i=function(e,t,n){if(!t()){
					document.getElementById(e).innerHTML=n;
					document.getElementById(e).style.display="block"
				}else{
					document.getElementById(e).style.display="none"
				}
		};
	var s=function(){
		n.navbar();
		window.location.hash=t?t:""
	};
	// 綁定兩次密碼一致與否檢查事件;
	var o=function(){
		var e=document.getElementById("form-signup-password");
		var t=document.getElementById("form-signup-password1");
		var n=e.value===t.value?true:false;
		i("form-signup-message",function(){
			return n
		},"Passwords don't match.");
		return n
	};
	document.getElementById("content").innerHTML=e.loginView();
	document.getElementById("form-signin-student-id").addEventListener("keyup",function(){
		i("form-signin-message",function(){
			return r("form-signin-student-id")
		},"The student is not one of the class students.")
	});
	document.getElementById("form-signin").addEventListener("submit",function(){
		if(!r("form-signin-student-id")){
			alert("The student is not one of the class students.");
			return false
		}
		// Parse.User.logIn(帳號, 密碼,{success: 登入成功的回調函數, error: 登入失敗的回調函數});
		Parse.User.logIn(document.getElementById("form-signin-student-id").value,document.getElementById("form-signin-password").value,
			{
				success:function(e){ 
					s() 
				},
			    error:function(e,t){
			    	i("form-signin-message",function(){
					return false
				    },"Invaild username or password.")
			    }
			})},false);
	//動態抓ID、PASSWORD
	document.getElementById("form-signup-student-id").addEventListener("keyup",function(){
		i("form-signup-message",function(){
			return r("form-signup-student-id")
		},"The student is not one of the class students.")});
	document.getElementById("form-signup-password1").addEventListener("keyup",o);
	
    // 綁定註冊按鈕觸發事件
	document.getElementById("form-signup").addEventListener("submit",function(){
		if(!r("form-signup-student-id")){
			alert("The student is not one of the class students.");
			return false
		}
		var e=o();
		if(!e){
			return false
		}
		// 創建一個 User物件
		var t=new Parse.User;
		// 設定帳號密碼電子郵件
		t.set("username",document.getElementById("form-signup-student-id").value);
		t.set("password",document.getElementById("form-signup-password").value);
		t.set("email",document.getElementById("form-signup-email").value);
		// 註冊一個新的使用者並直接登入
		t.signUp(null,
			{
				success:function(e){
					s()
			    },
			    error:function(e,t){
			    	i("form-signup-message",function(){
					return false
				},
				t.message)}
			})
	},false)
    }};
        //頁面切換
	    var r=Parse.Router.extend({
		  routes:{
			"":"indexView",
			"peer-evaluation/":"evaluationView",
			"login/*redirect":"loginView"
		  },
		  indexView:n.evaluationView,
		  evaluationView:n.evaluationView,
		  loginView:n.loginView
	    });
	// 讓Router活起來
	this.Router=new r;
	Parse.history.start();
	n.navbar()
})()
