import {Api} from '../../utils/api.js';
var api = new Api();
const app = getApp();
import {Token} from '../../utils/token.js';
const token = new Token();

Page({
  data: {
   sForm:{
      login_name:'',
      password:''
    },
    web_show:true,
  },

  onShow(){
    const self = this;
		self.setData({
		  web_show:self.data.web_show
		});
    if(wx.getStorageSync('threeInfo')&&wx.getStorageSync('threeToken')){
        self.setData({
          web_show:false
        });
        wx.redirectTo({
          url: '/pages/cancel/cancel'
        })
    }
  },

  submit(){
    const self = this;
    var postData={};
    wx.showLoading(); 
    if(api.checkComplete(self.data.sForm)){
         
      wx.setStorageSync('login',self.data.sForm);
    }else{
      api.showToast('请输入账号密码','none');
			return
    };
    const callback = (res)=>{
      if(res){       
          wx.setStorageSync('threeInfo',res.data.info); 
          wx.redirectTo({
            url: '/pages/cancel/cancel'
          })
          api.showToast('登陆成功','none')  
      }else{
          wx.hideLoading();
         api.showToast('用户不存在','none')
      }
    }
    token.getToken(callback);
  },


  bindInputChange(e){
    const self = this;
    api.fillChange(e,self,'sForm');
    self.setData({
      web_sForm:self.data.sForm,
    });
  },

  onLoad(options){
     const self = this;
  },
  
  intoPath(e){
    const self = this;
    api.pathTo(api.getDataSet(e,'path'),'nav');
  },

  back(e){
    const self = this;
    api.pathTo(api.getDataSet(e,'path'),'rela');
  },
 
})

  