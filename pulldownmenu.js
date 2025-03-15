//
// プルダウンメニュー補助スクリプト
//

var g_objPullDownMenuItemAry = [];
var g_objPullDownMenuItem = null;
var g_objWidthFixedShowItemAry = [];
var g_nTimerIDPullDownMenuHide = 0;
var g_objPullDownMenuHide = null;

var PullDownMenu = {
	// ブラウザ判定
	isOpera		: function(){return navigator.userAgent.toLowerCase().indexOf('opera') != -1;},
	isSafari	: function(){return navigator.userAgent.toLowerCase().indexOf('safari') != -1;},
	isGecko		: function(){return navigator.userAgent.toLowerCase().indexOf('gecko') != -1;},
	isIE		: function(){return !this.isOpera() && (navigator.userAgent.toLowerCase().indexOf('msie') != -1);},
	// 登録
	doRegist : function(){
		if(window.addEventListener)
			window.addEventListener('load', PullDownMenu.doInit, false);
		else if(window.attachEvent)
			window.attachEvent(['on', 'load'].join(''), PullDownMenu.doInit);
	},
	enumPullDownMenuItems : function(){
		var elements = PullDownMenu.getElementsByClass('mainmenu');
		elements = elements.concat(PullDownMenu.getElementsByClass('horzmenu1'));
		elements = elements.concat(PullDownMenu.getElementsByClass('horzmenu2'));
		elements = elements.concat(PullDownMenu.getElementsByClass('horzmenu3'));
		elements = elements.concat(PullDownMenu.getElementsByClass('horzmenu4'));
		elements = elements.concat(PullDownMenu.getElementsByClass('horzmenu5'));
		elements = elements.concat(PullDownMenu.getElementsByClass('horzmenu6'));
		elements = elements.concat(PullDownMenu.getElementsByClass('horzmenu7'));
		elements = elements.concat(PullDownMenu.getElementsByClass('horzmenu8'));
		elements = elements.concat(PullDownMenu.getElementsByClass('horzmenu9'));
		return elements;
	},
	// 初期化
	doInit : function(){
		this.menuOnMouse = false;
		this.doPullDownObj = null;
		var elements = PullDownMenu.enumPullDownMenuItems();
		g_objPullDownMenuItemAry = elements;
		if(elements){
			for( i=0; i<elements.length; i++ ){
				var obj = elements[i];
				var objMainMenu = obj;
				// OperaなどのIE以外のブラウザでoverflowを指定すると高さが不定となり背景が消えるため最小高さを指定
				objMainMenu.style.minHeight = PullDownMenu.getElementHeight(objMainMenu) + 'px';
				
				var ulTags = obj.getElementsByTagName( 'ul' );
				for( j=0; ulTags && j<ulTags.length; j++ ){
					var parentObj = PullDownMenu.getParentElement( ulTags[j] );
					var tagNameLI	= 'li';
					if( parentObj && parentObj.tagName && (parentObj.tagName.toLowerCase() == tagNameLI.toLowerCase()) ){
						var posPopup = PullDownMenu.getElementPosition(parentObj);
						posPopup.y += PullDownMenu.getElementHeight(parentObj);
						ulTags[j].style.top  = posPopup.y + 'px';
						ulTags[j].style.left = posPopup.x + 'px';

						// ポップアップUL
						ulTags[j].style.listStyle	= 'none';
						ulTags[j].onmouseover	= function(){PullDownMenu.doMenuMouseOver(this); return false;}
						ulTags[j].onmouseout	= function(){PullDownMenu.doMenuMouseOut(this); return false;}
					}
				}

				objMainMenu.style.overflow = 'visible';	// autoが設定されていると、Opera,Firefoxでメニューが表示されなくなる。

				var liTags = obj.getElementsByTagName('li')
				for(j=0; j<liTags.length; j++){
					var liTag = liTags[j];
					var ulTags = liTag.getElementsByTagName('ul');
					if(ulTags && (0 < ulTags.length)){
						liTag.onmouseover	= function(){PullDownMenu.doShowMenu(this,true); return false;}
					}
				}
			}
		}
	},
	// 要素のスタイル取得
	getElementStyle : function( targetObj,IEStyleParam,CSSStyleParam ){
		if( targetObj.currentStyle ){
			return targetObj.currentStyle[IEStyleParam];
		}else if( window.getComputedStyle ){
			var comStyle = window.getComputedStyle( targetObj,'' );
			return comStyle.getPropertyValue( CSSStyleParam );
		}
	},
	// 要素の位置取得
	getElementPosition : function(targetObj){
		var pos = new function(){this.x=0; this.y=0;}
		while( targetObj ){
			pos.x += targetObj.offsetLeft;
			pos.y += targetObj.offsetTop;
			targetObj = targetObj.offsetParent;
			// IE限定border幅の加算
			if( targetObj && PullDownMenu.isIE() ){
				pos.x += (parseInt(PullDownMenu.getElementStyle(targetObj,'borderLeftWidth','border-left-width')) || 0);
				pos.y += (parseInt(PullDownMenu.getElementStyle(targetObj,'borderTopWidth','border-top-width')) || 0);
			}
		}
		// Gecko限定body部のborder幅を２倍加算
		if( PullDownMenu.isGecko() ){
			var bodyObj = document.getElementsByTagName( 'BODY' )[0];
			pos.x += 2 * (parseInt(PullDownMenu.getElementStyle(bodyObj,'borderLeftWidth','border-left-width')) || 0);
			pos.y += 2 * (parseInt(PullDownMenu.getElementStyle(bodyObj,'borderTopWidth','border-top-width')) || 0);
		}
		return pos;
	},
	// 指定クラスの列挙
	getElementsByClass : function(findClass){
		var elements = null;
//		var allElements = document.all ? document.all : (document.getElementsByTagName ? document.getElementsByTagName('*') : null);
		var allElements = document.getElementsByTagName ? document.getElementsByTagName('DIV') : (document.all || null);
		if( allElements ){
			elements = new Array();
			for( i=0,j=0; i<allElements.length; i++ ){
				if( allElements[i].className == findClass ){
					elements[j] = allElements[i];
					j++;
				}
			}
		}
		return elements;
	},
	// 指定要素の親取得
	getParentElement : function(childObj){
		return childObj.parentNode || childObj.parentElement;
	},
	// 指定タグ名の親取得
	getParentByTagName : function(childObj, findTagName){
		var parentObj = PullDownMenu.getParentElement( childObj );
		while( parentObj && parentObj.tagName ){
			if( parentObj.tagName.toLowerCase() == findTagName.toLowerCase() )
				return parentObj;
			parentObj = PullDownMenu.getParentElement( parentObj );
		}
		return null;
	},
	getElementWidth : function( targetObj ){
		return targetObj.scrollWidth || targetObj.offsetWidth || targetObj.innerWidth || 0;
	},
	getElementHeight : function( targetObj ){
		return targetObj.scrollHeight || targetObj.offsetHeight || targetObj.innerHeight || 0;
	},
	isContainObj : function(parentObj, childObj){
		while(childObj){
			if(childObj == parentObj)
				return true;
			childObj = this.getParentElement(childObj);
		}
		return false;
	},
	doHideMenu : function(ulObj){
		ulObj.style.display = 'none';
	},
	doMenuMouseOver : function(menuObj){
		if(menuObj == g_objPullDownMenuHide){
			if(g_nTimerIDPullDownMenuHide){
				clearTimeout(g_nTimerIDPullDownMenuHide);
				g_nTimerIDPullDownMenuHide = 0;
				g_objPullDownMenuHide = null;
			}
		}

		PullDownMenu.menuOnMouse = true;
		PullDownMenu.doPullDownObj= menuObj;
	},
	doMenuMouseOut : function(menuObj){
		var bHit = false;
		if(!PullDownMenu.doPullDownObj)
			return;
		if(PullDownMenu.doPullDownObj != menuObj)
			return;
		if(!PullDownMenu.isContainObj(PullDownMenu.doPullDownObj, menuObj))
			return;

		PullDownMenu.menuOnMouse = false;
		PullDownMenu.doPullDownObj = null;
		if(g_nTimerIDPullDownMenuHide == 0){
			g_nTimerIDPullDownMenuHide = setTimeout("PullDownMenu.doTimeoutHidePulldownMenu()", 150);
			g_objPullDownMenuHide = menuObj;
		}
	},
	doTimeoutHidePulldownMenu : function(){
		g_nTimerIDPullDownMenuHide = 0;
		if(!g_objPullDownMenuHide)
			return;
		PullDownMenu.doHideMenu(g_objPullDownMenuHide);
		g_objPullDownMenuHide = null;
	},
	doHidePulldownMenu : function(){
		if( PullDownMenu.menuOnMouse )
			return;
		var elements = g_objPullDownMenuItemAry;
		if(elements){
			for( i=0; i<elements.length; i++ ){
				var obj = elements[i];
				var objMainMenu = obj;
				obj.onmouseout	= function(){return false;}
				
				if(PullDownMenu.isContainObj(objMainMenu, g_objPullDownMenuHide)){
					continue;
				}
				var ulTags = obj.getElementsByTagName( 'ul' );
				for( j=0; ulTags && j<ulTags.length; j++ ){
					var parentObj = PullDownMenu.getParentElement( ulTags[j] );
					var tagNameLI	= 'li';
					if( parentObj && parentObj.tagName && (parentObj.tagName.toLowerCase() == tagNameLI.toLowerCase()) ){
						// ポップアップUL
						ulTags[j].style.display = 'none';
					}
				}
			}
		}
	},
	// メニューの表示/非表示
	doShowMenu : function(obj, bShow){
		if( !bShow && PullDownMenu.menuOnMouse )
			return;
		if(g_objPullDownMenuItem == obj)
			return;

		var objMenu = (obj && obj.getElementsByTagName) ? obj.getElementsByTagName('ul').item(0) : null;
		var parentObj = PullDownMenu.getParentByTagName(obj, 'li');

		var bVert = (parentObj == null);
		if( objMenu ){
			obj.onmouseout	= function(){PullDownMenu.doHidePulldownMenu();	return false;}
			var bSkip = false;
			for(i=0; i<g_objWidthFixedShowItemAry.length; i++){
				if(g_objWidthFixedShowItemAry[i] != objMenu)
					continue;
				bSkip = true;
				break;
			}
			g_objWidthFixedShowItemAry[g_objWidthFixedShowItemAry.length] = objMenu;
			var objWidth = this.getElementWidth( obj );
			objMenu.style.margin	= '0px';
			objMenu.style.padding	= '0px';
			var menuWidth = this.getElementWidth( objMenu );
			if( objWidth < menuWidth )
				objWidth = menuWidth;
			var oldMenuDisplay = objMenu.style.display;
			if( oldMenuDisplay == 'none' )
				objMenu.style.display = bShow ? 'block' : 'none';
			if( bVert ){
				var offsetY = obj.offsetTop + obj.offsetHeight;
				offsetY = obj.offsetHeight;

				var liTags = objMenu.getElementsByTagName('li');
				if( liTags ){
					// 最大項目幅取得
					var maxLIWidth = 0;
					if(!bSkip){
						for( i=0; liTags && i<liTags.length; i++ ){
							var liTag = liTags[i];
							if( obj == liTag.parentElement )
								continue;
							var liWidth = PullDownMenu.getElementWidth( liTag );
							if( liWidth && (liWidth > maxLIWidth) )
								maxLIWidth = liWidth;
						}
					}
					if(!bSkip){
						var nDecWidth = 0;
						for( i=0; i<liTags.length; i++ ){
							var liTag = liTags[i];
							if( obj == liTag.parentElement ){
								offsetY += liTag.style.offestHeight;
							}else if(!bSkip){
								var liWidth = PullDownMenu.getElementWidth( liTag );
								if(liWidth < maxLIWidth){
									if(0 < nDecWidth){
										liTag.style.width	= (maxLIWidth - nDecWidth) + 'px';
									}else{
										liTag.style.width	= maxLIWidth + 'px';
										liWidth = PullDownMenu.getElementWidth( liTag );
										if(liWidth > maxLIWidth){
											var decWidth = liWidth - maxLIWidth;
											nDecWidth = liWidth - maxLIWidth;
											liTag.style.width	= (maxLIWidth - decWidth) + 'px';
										}
									}
								}
							}
						}
					}
				}
			}else{
				var width = this.getElementWidth( obj );
				objMenu.style.left	= '0px';
				objMenu.style.top	= PullDownMenu.getElementHeight( obj ) + 'px';
				
				var offsetY = obj.offsetHeight;
				var liTags = objMenu.getElementsByTagName( 'li' );
				if( liTags ){
					// 最大項目幅取得
					var maxLIWidth = 0;
					for( i=0; liTags && i<liTags.length; i++ ){
						var liTag = liTags[i];
						if( obj == liTag.parentElement )
							continue;
						var liWidth = PullDownMenu.getElementWidth( liTag );
						if( liWidth && (liWidth > maxLIWidth) )
							maxLIWidth = liWidth;
					}

					for( i=0; i<liTags.length; i++ ){
						var liTag = liTags[i];
						if( obj == liTag.parentElement ){
							liTag.style.position	= 'relative';
							liTag.style.top			= offsetY + 'px';
							offsetY += liTag.style.offestHeight;
						}else{
							var liWidth = PullDownMenu.getElementWidth( liTag );
							if( liWidth < maxLIWidth ){
								liTag.style.width	= maxLIWidth + 'px';
								liWidth = PullDownMenu.getElementWidth( liTag );
								if( liWidth > maxLIWidth ){
									var decWidth = liWidth - maxLIWidth;
									liTag.style.width	= (maxLIWidth - decWidth) + 'px';
								}
							}
						}
					}
				}
			}
			objMenu.style.display = bShow ? 'block' : 'none';
		}
	}
}

PullDownMenu.doRegist();
