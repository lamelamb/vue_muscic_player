
import {  getLyric } from '@/api/song.js'
import { ERR_OK } from '@/api/config'
import { Base64  } from 'js-base64'
// 创建一个song 类
export default class Song {

	constructor({
		id,
		mid,
		singer,
		name,
		album,
		duration,
		img,
		url
	}) {
		this.id = id
		this.mid = mid
		this.singer = singer
		this.name = name
		this.album = album
		this.duration = duration
		this.img = img
		this.url = url
	}

	getLyric() {
		if (this.lyric) {
			return Promise.resove(this.lyric)
		}

		// 为什么还要给getLyric 包一层，因为 getLyric 只做得到结果， 之后的容错处理又外层promise 处理，
		return new Promise((resolve, reject) => {
			getLyric(this.mid).then((res) => {
				if (res.retcode == ERR_OK) {
					// 挂载到song 实例上去
					this.lyric = Base64.decode(res.lyric);
					resolve(this.lyric)
				} else {
					reject('no lyric')
				}
			})
		})

	}
}

// 在 singerListDetail.vue 中被引用 ，创建songs 
export function createSingerSong(musicData, vkey) {
	return new Song({
		id: musicData.songid,
		mid: musicData.songmid,
		singer: filterSinger(musicData.singer),
		name: musicData.songname,
		album: musicData.albumname,
		duration: musicData.interval,
		img: `https://y.gtimg.cn/music/photo_new/T002R300x300M000${musicData.albummid}.jpg?max_age=2592000`,
		url: `http://dl.stream.qqmusic.qq.com/C400${musicData.songmid}.m4a?fromtag=38&guid=5931742855&vkey=${vkey}`
	})
}
/*
  真实audio 的播放地址是拼接出来的somgmid 和童年过songmid 的到歌曲vkey
*/
// 在songListDetail.vue 中使用
// `http://dl.stream.qqmusic.qq.com/C400${musicData.mid}.m4a?fromtag=38&guid=5931742855&vkey=${vkey}`
export function createSongList(musicData , vkey) {
	return new Song({
		id: musicData.id,
		mid: musicData.mid,
		singer: filterSinger(musicData.singer),
		name: musicData.name,
		album: musicData.album,
		duration: musicData.interval,
        img: `https://y.gtimg.cn/music/photo_new/T002R300x300M000${musicData.album.mid}.jpg?max_age=2592000`,
		url: `http://dl.stream.qqmusic.qq.com/C400${musicData.mid}.m4a?fromtag=38&guid=5931742855&vkey=${vkey}`
	})
}







// 处理 musicData.singer 数组，使其变为一个字符串
export function filterSinger(singer) {
	let result = []

	if (!singer) {
		return ''
	}

	singer.forEach((item) => {
		result.push(item.name)
	})

	return result.join(' / ')
}
