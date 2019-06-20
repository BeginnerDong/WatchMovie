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
		 is_show:false,
		 is_play:false,
		 isFirstLoadAllStandard: ['getSeatData'],
		 seatData:[],
		 checkData:{}
    },
		
	show(e){
		const self=this;
		self.data.is_show=!self.data.is_show;
		self.setData({
			is_show:self.data.is_show
		})
	},
	play(e){
		const self=this;
		self.data.is_play=!self.data.is_play;
		self.setData({
			is_play:self.data.is_play
		})
	},
	onLoad: function (options) {
		const self = this;
		api.commonInit(self);
		if (options.art_id&&options.sku_id) {
			self.data.art_id = options.art_id;
			self.data.sku_id = options.sku_id;
			self.getSeatData();
		} else {
			api.showToast('数据传递错误', 'none', 2000, function() {
				setTimeout(function() {
					wx.navigateBack({
						delta: 1
					})
				}, 2000)
			})
		}
	},
	
	check(e){
		const self = this;
		
		var item = api.getDataSet(e,'item');
		if(item){
			self.data.checkData = item;
		}else{
			api.showToast('mmm','fail')
		};
		
		console.log('self.data.checkData',self.data.checkData);
	},

	getSeatData(){
		const self = this;
		const postData = {};
		postData.paginate = api.cloneForm(self.data.paginate);
		postData.searchItem = {
			art_id: self.data.art_id
		};
		postData.order = {
			line:'asc'
		};
		const callback = (res) => {
			api.buttonCanClick(self, true);
			if (res.info.data.length > 0) {
				//self.data.seatData.push.apply(self.data.seatData, res.info.data);
				console.log('self.data.seatData',self.data.seatData);
				self.data.orginSeatData = res.info.data;
			};
			console.log('self.data.seatData',self.data.seatData)
			api.checkLoadAll(self.data.isFirstLoadAllStandard, 'getSeatData', self);
			self.initOrderData();	
		};
		api.SeatTableGet(postData, callback);

	},

	initOrderData(){
      const self =this;
      self.data.hasOne = false;
      self.data.orderData = [];
      const postData = {};
      postData.searchItem = {
        sku_id:self.data.sku_id,
        user_type:0
      };
      postData.tokenFuncName = 'getProjectToken';
      postData.getAfter = {
        Order:{
          tableName:'Order',
          middleKey:'order_no',
          key:'order_no',
          condition:'=',
          searchItem:{
            status:1,
            user_type:0
          },
        },
        UserInfo:{
          tableName:'UserInfo',
          middleKey:'user_no',
          key:'user_no',
          condition:'=',
          searchItem:{
            status:1
          },
        },
      };
      var callback = (res)=>{
      	if(res.info.data.length>0){
      		self.data.orderData = res.info.data;
      		self.data.seatData = [];
      		self.data.seatData = self.computeSeatMap(self.data.orginSeatData);
					console.log('self.data.seatData',self.data.seatData)
      		self.setData({
						web_seatData: self.data.seatData,
					});
      	};
      };
      api.orderItemGet(postData, callback);


    },

	computeSeatMap(data){
		const self = this;
		var max  = 0;
		var seatData = [];
		for (var i = 0; i < data.length; i++) {
			var seat = [];
			var sepeate = data[i].blank.split(',');
			if(data[i].num>max){
				max = data[i].num
			};
			var forNum = sepeate.length + data[i].num;
			var num = 0;
			for (var j = 0; j < forNum; j++) {
				if(sepeate.indexOf((j+1).toString())==-1){
					var findOrder = self.findSeat(data[i].line,(j-num+1));
		            if(findOrder&&findOrder.order_no==self.data.order_no){
		              self.data.hasOne = true;
		            };
		            seat.push({
		              seatNum:j-num+1,
		              seat:data[i].line+'-'+(j+1),
		              findOrder:findOrder
		            });
				}else{
					num++;
					seat.push({
						seatNum:j+1,
						seat:0
					});
				};	
			};
			seatData.push({
				line:data[i].line,
				seat:seat
			});	
		};

		return seatData;
	},

	findSeat(standard,discount){
      const self = this;
      var res = false;
      for(var i=0;i<self.data.orderData.length;i++){
        if(self.data.orderData[i]['Order'][0].standard==standard&&self.data.orderData[i]['Order'][0].discount==discount){
          res = self.data.orderData[i];
        };
      };
      return res;
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
