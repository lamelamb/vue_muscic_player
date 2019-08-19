//promise 封装jsonp
import originalJSONP  from 'jsonp'
export default function jsonp(url, data, opts) {
  url += ((url.indexOf('?') === -1) ? '?' : '&') + param(data)
	         // promise 封装jsonp  
	         return new Promise( (resolve ,reject)=>{
						      // 第三个参数为回调函数，耗时操作           
	         	     originalJSONP(url ,opts, (err, data)=>{
	         	     	 if (!err) {
					            resolve(data)
					          } else {
					            reject(err)
					          }
					      
	         	     })
	             })
          }



function param(data) {
  let url = ''
  for (let i in data) {
    let value = (data[i] !== undefined) ? data[i] : ''
    url += `&${i}=${encodeURIComponent(value)}`
  }
  // 删掉第一个 & ,方便jsonp 函数判断是？  还是 &
  return url ? url.substring(1) : ''
}
