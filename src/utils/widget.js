/**
* toast 提示
*
* @param title {String} 提示的标题
* @param dur {Number} 提示显示的时长
*/
function showToast(title, dur) {
    // console.log('==========show');
  wx.showToast({
    title: title,
    icon:'none',
    duration: dur || 2000
  });
}

function hideToast() {
  wx.hideToast();
}

export default {
  showToast: showToast,
  hideToast: hideToast,
}
