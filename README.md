# Josh & Jasper · 大嘻哈時代3

一部大約十一分鐘的積木動畫：Josh 和弟弟 Jasper 去參加《大嘻哈時代3》海選。三位評審 **J.Sheon、Gummy B、熱狗**，每人手上一條金項鍊；八位參賽者每人只有**三十秒**展現唱歌、饒舌或 R&B。拿到兩條項鍊晉級，三條全亮直接晉級還會噴火。

**線上看：** https://ywchen0711.github.io/josh-jasper-rap/ （播放時可以拖曳畫面轉視角；按「下載影片」可以存成影片檔）

## 參賽者

| | | 三十秒 |
|---|---|---|
| 金花阿嬤 | 72 歲・菜市場饒舌女王 | 高麗菜一顆三十；唱到一半接電話：「瓦斯爐？有啦我有關啦！」 |
| Lil 泡麵 | 16 歲・Trap 新星 | 鏈子比歌詞重，三十秒講了十一個 yeah，忘詞 |
| 凱文王子 | 22 歲・R&B 王子 | 轉音轉不停，對著 J.Sheon 唱情歌，最後一個高音破掉 |
| 外送員阿傑 | 28 歲・外送員 | 唱到一半接到新訂單，直接跑去送，再跑回來唱完 |
| 肌肉 Max | 30 歲・健身教練 | 邊做伏地挺身邊饒舌，做到趴在地上 |
| MC 憂鬱 | 25 歲・詩人 | 三十秒只說了「我……是……一片……雲」，評審睡著 |
| Josh | 10 歲・加州聖地牙哥 | 自己唱副歌（Auto-Tune）、自己寫的詞：taco 配滷肉飯，還有被弟弟偷吃的薯條 |
| Jasper | 8 歲・Josh 的弟弟 | 人中右邊的痣是他的 logo、恐龍、一聲恐龍吼、承認薯條是他吃的、mic drop |

## 怎麼做的

- 用《武林積木》的電影引擎（`js/engine.js`、`js/film.js`）；嘻哈舞台在 `js/hiphop.js`：LED 大螢幕（節目 logo、參賽者名牌、跟著節拍跳的視覺化、項鍊）、塗鴉牆、DJ 台、噴火、評審桌（每人一條會亮的金項鍊）、跟著節拍晃的積木觀眾
- 角色在 `js/cast/rap.js`，劇本在 `js/films/rap1.js`
- 表演：`tools/perform.py`。每首歌的 beat 都是程式合成的（boom bap、trap、R&B、house、lo-fi：大鼓、小鼓、hi-hat、808、和弦）；饒舌是 edge-tts 念出來，再用 rubberband 拉到剛好落在拍子上；唱歌是每個字分開錄，再用 TD-PSOLA 把音高修到旋律上（就是 R&B 的 Auto-Tune 聲音）。歌詞和節拍在 `tools/songs.py`
- 對白：`tools/voices.py`（edge-tts）；音效（電話、外送通知、恐龍吼、mic drop、打呼、刷碟、項鍊）在 `tools/sfx.py`；觀眾的笑聲、掌聲是真實錄音（CC0）
- 影片：`node tools/render.mjs rap1` 一格一格算出 1080p MP4

## 重做

```
python tools/perform.py                    # 八首表演
python tools/sfx.py                        # 音效
node tools/lines.mjs rap1 > tools/lines.json
python tools/voices.py tools/lines.json    # 對白
```
