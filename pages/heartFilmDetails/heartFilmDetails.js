import {Api} from '../../utils/api.js';
var api = new Api();
const app = getApp();
import {Token} from '../../utils/token.js';
const token = new Token();

//index.js
//获取应用实例
//触摸开始的事件

Page({
  data: {
		 is_show:true
		 
   },
		
	show(e){
		const self=this;
		self.data.is_show=false;
		self.setData({
			is_show:self.data.is_show
		})
	},
	onLoad: function (options) {
	},
	
  intoPathRedirect(e){
    const self = this;
    api.pathTo(api.getDataSet(e,'path'),'redi');
  },
  intoPath(e){
    const self = this;
    api.pathTo(api.getDataSet(e,'path'),'nav');
  }
	})
