# The eight 30-second performances of 《大嘻哈時代3》. Each: a beat (style, bpm, chords, bars), a voice
# (edge-tts voice, pitch Hz, rate %), and its lines. 'at' and 'beats' count beats from the top of the song.
#   rap  — fitted to its beats    sing — 'syllable=note[,note…][@beats]'    talk — said as is    adlib — a shout, doubled
APP = ('zh-TW-HsiaoYuNeural', 0, 0)   # the delivery app's own voice

SONGS = {
    # 金花阿嬤, 72: the queen of the morning market raps the price of cabbage, and takes a phone call in the middle
    'jinhua': {'style': 'boom', 'bpm': 90, 'bars': 12, 'intro': 1, 'chords': ['Am', 'Dm', 'G', 'C'], 'voice': ('zh-TW-HsiaoChenNeural', -18, -4),
        'lines': [
            {'kind': 'rap', 'at': 4, 'beats': 4, 'text': 'Yo！菜市場的女王，金花來報到！', 'en': 'Yo! Queen of the morning market — Jinhua’s in the house!'},
            {'kind': 'rap', 'at': 8, 'beats': 4, 'text': '高麗菜一顆三十，比你們饒舌還要好！', 'en': 'Cabbage, thirty a head — better than your rapping!'},
            {'kind': 'rap', 'at': 12, 'beats': 4, 'text': '蔥給你，薑給你，九層塔也送給你！', 'en': 'Scallions for you, ginger for you, basil’s on the house!'},
            {'kind': 'rap', 'at': 16, 'beats': 4, 'text': '年輕人不要熬夜，熬夜不如吃地瓜粥！', 'en': 'Young folks, don’t stay up late — have sweet-potato porridge!'},
            {'kind': 'talk', 'at': 21, 'text': '喂？我在比賽啦！……瓦斯爐？有啦，我有關啦！', 'en': 'Hello? I’m in a contest! …The stove? Yes, I turned it off!'},
            {'kind': 'talk', 'at': 28, 'text': '好，阿嬤回來了。剛剛唸到哪？', 'en': 'OK, Grandma’s back. Where was I?'},
            {'kind': 'rap', 'at': 32, 'beats': 4, 'text': '評審你們三個太瘦，等一下來阿嬤家吃飯！', 'en': 'You three judges are too thin — dinner at Grandma’s after!'},
            {'kind': 'rap', 'at': 36, 'beats': 4, 'text': '阿嬤今年七十二，饒舌比你們還多年！', 'en': 'Grandma’s seventy-two — been rapping longer than you!'},
            {'kind': 'adlib', 'at': 41, 'text': 'Peace！記得帶環保袋！', 'en': 'Peace! Bring your own shopping bag!'},
        ]},
    # Lil 泡麵, 16: a trap rapper with a chain bigger than his verse
    'paomian': {'style': 'trap', 'bpm': 140, 'bars': 18, 'intro': 2, 'chords': ['Cm', 'Ab', 'Eb', 'Bb'], 'voice': ('zh-CN-YunxiaNeural', 4, 8),
        'lines': [
            {'kind': 'adlib', 'at': 8, 'text': 'Yeah！Skrrt skrrt！', 'en': 'Yeah! Skrrt skrrt!'},
            {'kind': 'rap', 'at': 12, 'beats': 4, 'text': 'Lil 泡麵 in the house！', 'say': 'Lil 泡麵, in the house！', 'en': 'Lil Noodle in the house!'},
            {'kind': 'rap', 'at': 16, 'beats': 4, 'text': '我的鏈子很重，我的泡麵很燙！', 'en': 'My chain is heavy, my noodles are hot!'},
            {'kind': 'rap', 'at': 20, 'beats': 4, 'text': '我的……我的……', 'en': 'My… my…', 'fx': False},
            {'kind': 'adlib', 'at': 25, 'text': 'Yeah。', 'en': 'Yeah.'},
            {'kind': 'adlib', 'at': 29, 'text': 'Yeah yeah。', 'en': 'Yeah yeah.'},
            {'kind': 'talk', 'at': 33, 'text': '等一下……我忘詞了。', 'en': 'Hold on… I forgot my words.', 'feel': -12},
            {'kind': 'adlib', 'at': 40, 'text': 'Skrrt！', 'en': 'Skrrt!'},
            {'kind': 'rap', 'at': 46, 'beats': 8, 'text': '泡麵……泡麵……泡麵要加蛋！', 'en': 'Noodles… noodles… noodles need an egg!'},
            {'kind': 'adlib', 'at': 58, 'text': '……yeah。', 'en': '…yeah.'},
        ]},
    # 凱文王子, 22: R&B, more runs than notes, all of them sung at J.Sheon, and one high note too many
    'kaiwen': {'style': 'rnb', 'bpm': 70, 'bars': 9, 'intro': 1, 'chords': ['Ebmaj7', 'Cm7', 'Abmaj7', 'Bb'], 'voice': ('zh-CN-YunxiNeural', 0, 0),
        'lines': [
            {'kind': 'sing', 'at': 4, 'text': '寶貝～你是我的唯一～', 'en': 'Baby~ you’re my only one~', 'notes': '寶=Eb4 貝=F4 你=G4 是=Bb4 我=C5 的=Bb4 唯=G4 一=F4,G4,F4,Eb4'},
            {'kind': 'sing', 'at': 12, 'text': '喔～耶～耶～～', 'en': 'Oh~ yeah~ yeah~~', 'notes': '喔=Bb4,C5,Bb4,G4@2 耶=F4,G4,Bb4,C5,Bb4,G4@2 耶=Eb4,F4,G4,F4,Eb4@2 -=Eb4@2', 'vib': 0.02},
            {'kind': 'sing', 'at': 20, 'text': 'J 哥～我為你唱這首歌～', 'en': 'J-ge~ I sing this song for you~', 'notes': 'J=G4@0.5 哥=G4@0.5 我=Bb4 為=C5 你=Bb4 唱=G4 這=F4 首=G4 歌=Eb4,F4'},
            {'kind': 'sing', 'at': 28, 'text': '耶～～～～（破音）', 'en': 'Yeah~~~~ (voice cracks)', 'notes': '耶=Eb5@4', 'style': 'crack', 'vib': 0.03},
            {'kind': 'talk', 'at': 33, 'text': '……抱歉，我昨天吃太多鹹酥雞。', 'en': '…Sorry. Too much popcorn chicken last night.'},
        ]},
    # 外送員阿傑, 28: raps his route, and leaves in the middle for an order
    'ajie': {'style': 'boom', 'bpm': 96, 'bars': 13, 'intro': 1, 'chords': ['Dm', 'Bb', 'F', 'C'], 'voice': ('zh-CN-YunjianNeural', -4, 4),
        'lines': [
            {'kind': 'rap', 'at': 4, 'beats': 4, 'text': '外送外送，風雨無阻，使命必達！', 'en': 'Delivery, delivery — rain or shine, always on time!'},
            {'kind': 'rap', 'at': 8, 'beats': 4, 'text': '三樓沒電梯，我的腿已經不是我的腿！', 'en': 'Third floor, no lift — my legs aren’t my legs any more!'},
            {'kind': 'rap', 'at': 12, 'beats': 4, 'text': '珍奶半糖少冰，我背得比歌詞還熟！', 'en': 'Bubble tea, half sugar, less ice — I know it better than my lyrics!'},
            {'kind': 'rap', 'at': 16, 'beats': 4, 'text': '客人說放門口，門口到底在哪裡！', 'en': 'Customer says leave it at the door — WHICH door?!'},
            {'kind': 'talk', 'at': 20.5, 'text': '叮咚！您有一筆新訂單。', 'en': '(his phone) Ding-dong! You have a new order.', 'voice': APP, 'phone': True},
            {'kind': 'talk', 'at': 24.5, 'text': '評審不好意思，這單十五分鐘要送到。', 'en': 'Sorry, judges — this one has to be there in fifteen minutes.'},
            {'kind': 'talk', 'at': 40, 'text': '送到了！記得給我五星好評！', 'en': 'Delivered! Remember, five stars!'},
            {'kind': 'rap', 'at': 44, 'beats': 4, 'text': '外送外送，風雨無阻，使命必達！', 'en': 'Delivery, delivery — rain or shine, always on time!'},
        ]},
    # 肌肉 Max, 30: raps while doing push-ups, until he can't
    'max': {'style': 'house', 'bpm': 124, 'bars': 16, 'intro': 2, 'chords': ['Am', 'F', 'C', 'G'], 'voice': ('zh-CN-YunjianNeural', -12, 6),
        'lines': [
            {'kind': 'rap', 'at': 8, 'beats': 4, 'text': '一！二！三！四！胸肌在跳舞！', 'en': 'One! Two! Three! Four! My pecs are dancing!'},
            {'kind': 'rap', 'at': 12, 'beats': 4, 'text': '伏地挺身一百下，饒舌只是暖身！', 'en': 'A hundred push-ups — rapping’s just my warm-up!'},
            {'kind': 'rap', 'at': 16, 'beats': 4, 'text': '蛋白質！雞胸肉！一天要吃六餐！', 'en': 'Protein! Chicken breast! Six meals a day!'},
            {'kind': 'talk', 'at': 21, 'text': '呼……呼……等一下……', 'en': 'Huff… huff… hold on…', 'feel': -15},
            {'kind': 'rap', 'at': 28, 'beats': 4, 'text': '腿日不能跳過，人生也不能跳過！', 'en': 'Never skip leg day — never skip life!'},
            {'kind': 'talk', 'at': 34, 'text': '呼……呼……我……需要……喝水……', 'en': 'Huff… huff… I… need… water…', 'feel': -20},
            {'kind': 'adlib', 'at': 46, 'text': '啊！', 'en': 'Argh!'},
        ]},
    # MC 憂鬱, 25: slam poetry, slower than the beat can wait
    'youyu': {'style': 'lofi', 'bpm': 72, 'bars': 9, 'intro': 1, 'chords': ['Fmaj7', 'Em7', 'Dm7', 'Cmaj7'], 'voice': ('zh-CN-YunyangNeural', -8, -25), 'end_hit': False, 'scratch': False,
        'lines': [
            {'kind': 'rap', 'at': 4.5, 'beats': 3, 'text': '我……', 'en': 'I…', 'fx': False, 'minTempo': 0.3},
            {'kind': 'rap', 'at': 13, 'beats': 3, 'text': '是……', 'en': 'am…', 'fx': False, 'minTempo': 0.3},
            {'kind': 'rap', 'at': 21, 'beats': 4, 'text': '一片……', 'en': 'a…', 'fx': False, 'minTempo': 0.3},
            {'kind': 'rap', 'at': 31, 'beats': 3, 'text': '雲。', 'en': 'cloud.', 'fx': False, 'minTempo': 0.3},
            {'kind': 'talk', 'at': 38, 'text': '……我還沒唸完。', 'en': '…I wasn’t finished.'},
        ]},
    # Josh, 10, from San Diego: sings the hook, then raps his own verse
    'josh': {'style': 'boom', 'bpm': 92, 'bars': 12, 'intro': 1, 'chords': ['Am', 'F', 'C', 'G'], 'voice': ('zh-CN-YunxiaNeural', 4, 10),
        'lines': [
            {'kind': 'sing', 'at': 4, 'text': '從聖地牙哥，飛到這個舞台～', 'en': 'From San Diego, flew all the way to this stage~', 'notes': '從=E4@0.5 聖=G4@0.5 地=A4@0.5 牙=G4@0.5 哥=E4 飛=D4@0.5 到=E4@0.5 這=G4@0.5 個=A4@0.5 舞=C5 台=B4,A4@2', 'vib': 0.008},
            {'kind': 'rap', 'at': 12, 'beats': 4, 'text': '我是 Josh 十歲，來自加州的海灘！', 'say': '我是 Josh，十歲，來自加州的海灘！', 'en': 'I’m Josh, I’m ten, from a California beach!'},
            {'kind': 'rap', 'at': 16, 'beats': 4, 'text': '早餐吃 taco，晚餐吃滷肉飯！', 'en': 'Tacos for breakfast, braised-pork rice for dinner!'},
            {'kind': 'rap', 'at': 20, 'beats': 4, 'text': '星期六中文學校，一筆一畫不簡單！', 'en': 'Chinese school on Saturdays — every stroke is hard work!'},
            {'kind': 'rap', 'at': 24, 'beats': 4, 'text': '弟弟偷吃我薯條，這筆帳我還沒算！', 'en': 'My brother stole my fries — I haven’t settled that score!'},
            {'kind': 'rap', 'at': 28, 'beats': 4, 'text': '我的 flow 像衝浪，一波一波一波一波停不下來！', 'en': 'My flow’s like surfing, wave after wave after wave, can’t stop!'},
            {'kind': 'rap', 'at': 32, 'beats': 4, 'text': '評審評審請注意，這段歌詞我自己寫！', 'en': 'Judges, judges, listen up — I wrote these lines myself!'},
            {'kind': 'sing', 'at': 36, 'text': '從聖地牙哥，飛到這個舞台～', 'en': 'From San Diego, flew all the way to this stage~', 'notes': '從=E4@0.5 聖=G4@0.5 地=A4@0.5 牙=G4@0.5 哥=E4 飛=D4@0.5 到=E4@0.5 這=G4@0.5 個=A4@0.5 舞=C5 台=B4,A4,G4@2', 'vib': 0.01},
            {'kind': 'adlib', 'at': 44, 'text': 'Josh out！', 'en': 'Josh out!'},
        ]},
    # Jasper, 8: the mole above his lip, dinosaurs, and a confession about the fries
    'jasper': {'style': 'trap', 'bpm': 140, 'bars': 18, 'intro': 2, 'chords': ['Gm', 'Eb', 'Bb', 'F'], 'voice': ('zh-CN-YunxiaNeural', 18, 18),
        'lines': [
            {'kind': 'rap', 'at': 8, 'beats': 8, 'text': '我是 Jasper 八歲，人中右邊有一顆痣！', 'say': '我是 Jasper，八歲，人中右邊有一顆痣！', 'en': 'I’m Jasper, I’m eight, there’s a mole above my lip!'},
            {'kind': 'rap', 'at': 16, 'beats': 8, 'text': '這顆痣是我的 logo，看清楚不要放肆！', 'en': 'This mole is my logo — take a good look, show respect!'},
            {'kind': 'rap', 'at': 24, 'beats': 8, 'text': '暴龍、迅猛龍、三角龍，還有劍龍！', 'en': 'T. rex, velociraptor, triceratops, and stegosaurus!'},
            {'kind': 'rap', 'at': 32, 'beats': 8, 'text': '哥哥說我太吵，我說我是低音砲！', 'en': 'Big brother says I’m loud — I say I’m the subwoofer!'},
            {'kind': 'adlib', 'at': 40, 'text': '吼——！', 'en': 'RAWR!', 'gain': 1.1},
            {'kind': 'rap', 'at': 44, 'beats': 5, 'text': '哥哥的薯條，其實是我吃掉的！', 'en': 'Big brother’s fries — it was me who ate them!'},
            {'kind': 'rap', 'at': 52, 'beats': 8, 'text': '評審給我項鍊，我要拿去換冰淇淋！', 'en': 'Judges, give me a chain — I’ll trade it for ice cream!'},
            {'kind': 'adlib', 'at': 62, 'text': 'Jasper！麥克風放下！', 'en': 'Jasper! Mic drop!'},
        ]},
}
