/* --------------------------------------------------------------------------------------------------------------------
	程式用途：動態視窗主要函式庫（物件版本） by Jainbin Huang
 
	程式規則：

		1. 必需引用到 jquery.min.js

	修改歷史：

		2015/07/13	(建彬)	修改遮罩寬高的設定方式，改為 $(window) 取得。
		2014/06/19	(建彬)	增加可指定頁面內容的動態視窗功能 (OpenDynamicWindowForDesignationPageContent)。
		2014/05/09	(建彬)	增加重新設定視窗的 XY 軸位置方法 (onReSetWindowXY) 。
		2012/06/14	(建彬)	於「開啟動態表單」事件，增加開啟畫面後 Focus 預設為搜尋欄位。
		2011/12/19	(建彬)	檔案建立。
-------------------------------------------------------------------------------------------------------------------- */

oDynamicWindow = function (_Page) 
{
	this.Init(_Page) ;
};

oDynamicWindow.prototype = 
{
	m_bError : false,
	m_oDynamicElement : null,
	m_sFilterKeywordId : "_kw",
	m_sPage : null,
	m_oMask : null,
	m_Browser : null,
	m_mDelegate : 
	{
		"Init" : [],
		"OpenDynamicWindow" : [],
		"onShowWindow" : [],
		"onReWindowSize" : [],
		"onHidenWindow" : [],
		"ShowFullMask" : [],
		"HidenFullMask" : [],
		"QueryForm" : [],
		"JumpPage" : [],
		"Submit" : [],
		"Other" : []
	},

	// ----------------------------------------------------------------------------------------------------------------
	// 初始化物件
	// ----------------------------------------------------------------------------------------------------------------
	Init : function(_Page)
	{
		this.m_Browser					= jQuery.browser ;
		this.m_oDynamicElement			= document.createElement("div") ;
		this.m_oDynamicElement.id		= "_" + _Page + "_DW_Element" ;

		var	bIsIE6						= false ;

		// 引用 DynamicWindow CSS 定義檔
		document.write("<link type=\"text/css\" rel=\"stylesheet\" href=\"DynamicWindow.css\" />") ;

		this.m_oDynamicElement.className = "DynamicWindowStyle" ;

		this.m_sPage					= _Page;
		this.m_sFilterKeywordId			= this.m_sPage + this.m_sFilterKeywordId;

		

		if (this.m_oDynamicElement == null || this.m_sPage == null)
			m_bError = true;

		if (this.m_bError)
			alert("oDynamicWindow 物件初始化失敗！");

		if(!this.m_bError)
		{
			this.Delegate("Init");
			document.body.appendChild(this.m_oDynamicElement);
		}
	},

	// ----------------------------------------------------------------------------------------------------------------
	// 開啟動態表單
	// ----------------------------------------------------------------------------------------------------------------
	OpenDynamicWindow : function (nJumpPageNo, strQueryString) 
	{
		if (this.m_bError) return ;

		var m_Content = this ;

		$.ajax
		(
			{
				url: this.m_sPage + "?p=" + nJumpPageNo + strQueryString,
				beforeSend : function () {
					m_Content.m_oDynamicElement.innerHTML = "<img src=\"loading.gif\" />" ;
					m_Content.onShowWindow() ;
				},
				success : function (data) {
					if (data != null) {
						m_Content.Delegate("OpenDynamicWindow", data) ;
						m_Content.m_oDynamicElement.innerHTML = data ;

						if(document.getElementById(m_Content.m_sFilterKeywordId) != null)
						{
							var objElement = document.getElementById(m_Content.m_sFilterKeywordId) ;
							
							if(objElement.value == null)
								objElement.focus() ;
							else
								objElement.select() ;
						}

						m_Content.onReSetWindowXY() ;
					}
				},
				statusCode : {
					404 : function()
					{
						alert("找不到指定的頁面") ;
						m_Content.onHidenWindow() ;
					},
					500 : function()
					{
						alert("網頁執行時發生錯誤") ;
						m_Content.onHidenWindow() ;
					}
				}
			}
		);
	},

	// ----------------------------------------------------------------------------------------------------------------
	// 開啟指定頁面內容的動態視窗
	// ----------------------------------------------------------------------------------------------------------------
	OpenDynamicWindowForDesignationPageContent : function (_PageContent, _Style) 
	{
		if (this.m_bError) return ;

		var m_Content = this ;

		if(_Style != null)
			$(this.m_oDynamicElement).attr("style", _Style) ;

		$(this.m_oDynamicElement).html(_PageContent) ;
		
		this.onShowWindow() ;
		this.onReSetWindowXY() ;

		this.m_oMask.className = "DynamicWindowMaskOnSetCursor" ;

		// 對全景遮罩加入滑鼠左鍵按下的事件
		this.m_oMask.onclick = function()
		{
			m_Content.onHidenWindow() ;
		} ;
	},

	// ----------------------------------------------------------------------------------------------------------------
	// 顯示視窗
	// ----------------------------------------------------------------------------------------------------------------
	onShowWindow : function () 
	{
		if (this.m_bError) return ;

		this.onReWindowSize() ;
		this.ShowFullMask() ;
		this.Delegate("onShowWindow") ;
		this.m_oDynamicElement.style.display = "block" ;
	},

	// ----------------------------------------------------------------------------------------------------------------
	// 重新設定視窗大小
	// ----------------------------------------------------------------------------------------------------------------
	onReWindowSize : function () 
	{
		if (this.m_bError) return ;

		var t, l ;
		if (document.all) {
			l = (document.documentElement.clientWidth / 2) - 240 ;
		}
		else if (document.layers || document.getElementById) {
			l = (window.innerWidth / 2) - 240 ;
		}

		this.Delegate("onReWindowSize") ;
		this.m_oDynamicElement.style.left = l + "px" ;
		this.m_oDynamicElement.style.top = "100px" ;
	},

	// ----------------------------------------------------------------------------------------------------------------
	// 重新設定視窗的 XY 軸位置
	// ----------------------------------------------------------------------------------------------------------------
	onReSetWindowXY : function()
	{
		if (this.m_bError) return ;
		if (this.m_oDynamicElement.offsetWidth == null) return ;
		if (this.m_oDynamicElement.style.left == null) return ;

		var oW = this.m_oDynamicElement.offsetWidth ;

		if(oW > 0)
		{
			this.m_oDynamicElement.style.left = (this.m_oDynamicElement.style.left.toString().replace('px', '') - Math.round(oW / 4)) + "px" ;
		}
	},

	// ----------------------------------------------------------------------------------------------------------------
	// 隱藏視窗
	// ----------------------------------------------------------------------------------------------------------------
	onHidenWindow : function () 
	{
		if (this.m_bError) return ;

		this.HidenFullMask() ;
		this.Delegate("onHidenWindow") ;
		this.m_oDynamicElement.style.display = "none" ;
		this.m_oDynamicElement.innerHTML = "" ;
	},

	// ----------------------------------------------------------------------------------------------------------------
	// 顯示全景遮罩
	// ----------------------------------------------------------------------------------------------------------------
	ShowFullMask : function()
	{
		if (this.m_bError) return ;

		if (this.m_oMask == null)
		{
			this.m_oMask	= document.createElement("div") ;

			this.m_oMask.className = "DynamicWindowMask" ;
		}

		w = $(window).width();
		h = $(window).height();
		wa = 0;

		this.m_oMask.style.width	= (w - wa) + "px" ;
		this.m_oMask.style.height	= h + "px" ;
		this.m_oMask.style.display	= "block" ;

		document.body.appendChild(this.m_oMask) ;
	},

	// ----------------------------------------------------------------------------------------------------------------
	// 隱藏全景遮罩
	// ----------------------------------------------------------------------------------------------------------------
	HidenFullMask : function ()
	{
		if (this.m_bError) return ;
		if (this.m_oMask == null) return ;
		
		document.body.removeChild(this.m_oMask) ;
		this.m_oMask = null ;
	},

	// ----------------------------------------------------------------------------------------------------------------
	// 處理搜尋表單
	// ----------------------------------------------------------------------------------------------------------------
	QueryForm : function (sQueryString)
	{
		if (this.m_bError) return ;

		this.Delegate("QueryForm") ;
		this.OpenDynamicWindow(0, (sQueryString != null ? encodeURI(sQueryString) : "")) ;
	},

	// ----------------------------------------------------------------------------------------------------------------
	// 使用分頁動作
	// ----------------------------------------------------------------------------------------------------------------
	JumpPage : function (nPageNo, strQuery) 
	{
		if (this.m_bError) return ;

		this.Delegate("JumpPage") ;
		this.OpenDynamicWindow(nPageNo, strQuery) ;
	},

	// ----------------------------------------------------------------------------------------------------------------
	// 送出表單
	// ----------------------------------------------------------------------------------------------------------------
	Submit : function (_data) 
	{
		if (this.m_bError) return ;

		this.Delegate("Submit", _data) ;
		this.onHidenWindow() ;
	},

	// ----------------------------------------------------------------------------------------------------------------
	// 加入指定的委派函式
	// ----------------------------------------------------------------------------------------------------------------
	AddDelegate : function (_delegateId, _object)
	{
		if (this.m_bError) return ;

		if(this.m_mDelegate[_delegateId] != null)
			this.m_mDelegate[_delegateId].push(_object) ;
	},

	// ----------------------------------------------------------------------------------------------------------------
	// 執行委派函式
	// ----------------------------------------------------------------------------------------------------------------
	Delegate : function (_delegateId, _data)
	{
		if (this.m_bError) return ;
		
		if(this.m_mDelegate[_delegateId] != null)
		{
			for($i in this.m_mDelegate[_delegateId])
			{
				if(typeof(this.m_mDelegate[_delegateId][$i]) == 'function')
					new this.m_mDelegate[_delegateId][$i](_data) ;
			}
		}
	}
};
