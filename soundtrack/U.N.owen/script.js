document.addEventListener('DOMContentLoaded', () => {
 
  // js-audio クラスの audio 要素を全て取得
  const jsAudios = document.querySelectorAll('.js-audio');
 
  // 上記で取得した各要素を関数 createAudioPlayer() に渡して実行
  jsAudios.forEach((audio) => {
    // 対象の audio 要素をカスタムプレーヤーで表示
    createAudioPlayer(audio);
  });
 
  // id が foo の要素を取得
  const foo = document.getElementById('foo');
  // 関数に渡して実行（引数に背景色とボリュームの初期値を指定）
  createAudioPlayer(foo, 'yellow', 'pink', 0.8);
 
  /* 以下カスタムプレーヤーを表示する関数の定義   */
 
  /**
  * カスタムプレーヤーを表示する関数
  * 別途定義した関数 secToHMS() と updateSlider() が必要
  * @param {HTMLElement}  audio （カスタムプレーヤーで表示する audio 要素 ※必須）
  * @param {String}  bgc スライダー部分のトラックの背景色（省略時は #ccc）
  * @param {String}  color スライダー部分の変化する領域の背景色（省略時は #8ea8f9）
  * @param {Float}  vol 初期ボリューム。0.0〜1.0 の範囲で指定（省略時は 1.0）
  */
  function createAudioPlayer(audio, bgc, color, vol = 1.0) {
 
    // 第1引数の audio が存在しない場合やそれが audio 要素でなければ終了
    if (!audio || audio.tagName !== 'AUDIO') {
      return;
    }
 
    // オーディオプレーヤーをラップする div 要素（ラッパー）を作成
    const audioPlayer = document.createElement('div');
    // クラス属性を付与
    audioPlayer.className = 'audio-player';
    // audio 要素の前にラッパーを挿入
    audio.parentNode.insertBefore(audioPlayer, audio);
    // audio 要素をラッパーに追加
    audioPlayer.appendChild(audio);
 
    // コントロール部分の HTML
    const controls = `<div class="controls">
    <button class="toggle play-btn" type="button" aria-label="Play"></button>
    <div class="time" role="timer">
      <span class="current-time">0:00</span>
    </div>
    <input class="range-slider" type="range" name="seek" value="0" step=".1" aria-label="seek bar">
    <div class="time" role="timer">
      <span class="duration">0:00</span>
    </div>
    <button class="mute volume-btn" type="button" aria-label="Mute"></button>
    <input class="range-slider" type="range" name="vol" min="0.0" max="1.0" value="1.0" step=".1" aria-label="volume bar">
    <button class="loop loop-btn" type="button" aria-label="Loop"></button>
  </div>`;
 
    // コントロール部分を insertAdjacentHTML でラッパーに追加
    audioPlayer.insertAdjacentHTML('afterbegin', controls);
    // audio 要素を非表示に
    audio.controls = false;
 
    // 引数の vol を volume に設定
    audio.volume = vol;
    // iPhone 対策
    audio.preload = 'metadata';
 
    // トグルボタン（再生・停止ボタン）
    const toggleBtn = audioPlayer.querySelector('.toggle');
    // 現在の再生位置（時間）を表示する要素
    const ctSpan = audioPlayer.querySelector('.time .current-time');
    // 現在の再生位置（時間）を hh:mm:ss に変換して表示
    ctSpan.textContent = secToHMS(audio.currentTime);
    // 再生時間を表示する要素
    const durSpan = audioPlayer.querySelector('.time .duration');
 
    // ループボタン
    const loopBtn = audioPlayer.querySelector('.loop');
 
    // ループボタンがクリックされた際の処理
    loopBtn.addEventListener('click', () => {
      if (audio.loop) {
        audio.loop = false;
        loopBtn.classList.remove('looped');
        loopBtn.setAttribute('aria-label', 'Loop');
      } else {
        audio.loop = true;
        loopBtn.classList.add('looped');
        loopBtn.setAttribute('aria-label', 'Unloop');
      }
    });
 
    // 記述されている audio 要素の loop 属性の値をループボタンに反映
    if (!audio.loop) {
      audio.loop = false;
      loopBtn.classList.remove('looped');
      loopBtn.setAttribute('aria-label', 'Loop');
    } else {
      audio.loop = true;
      loopBtn.classList.add('looped');
      loopBtn.setAttribute('aria-label', 'Unloop');
    }
 
    // ボリュームスライダー
    const volumeBar = audioPlayer.querySelector('input[name="vol"]');
    // スライダーの値に現在の volume の値（初期値）を設定
    volumeBar.value = audio.volume;
    // スライダーの値が変更されたら
    volumeBar.addEventListener('input', (e) => {
      // スライダーの値に現在の値を設定
      audio.volume = e.currentTarget.value;
      // ミュート中であればミュートを解除
      if (audio.muted) {
        audio.muted = false;
        muteBtn.classList.remove('muted');
        muteBtn.setAttribute('aria-label', 'Mute');
      }
    });
 
    // ミュートボタン
    const muteBtn = audioPlayer.querySelector('.mute');
 
    // ミュートボタンがクリックされた際の処理
    muteBtn.addEventListener('click', () => {
      // ミュート中であれば
      if (audio.muted) {
        // ミュートを解除
        audio.muted = false;
        // ボリュームバーの位置を更新
        volumeBar.value = audio.volume;
        // ボリュームバーの背景色を更新
        updateSlider(volumeBar, bgc, color);
        // ミュートボタンの背景色を変更
        muteBtn.classList.remove('muted');
        // ミュートボタンの aria-label 属性の値を変更
        muteBtn.setAttribute('aria-label', 'Mute');
      } else {
        // ミュートする
        audio.muted = true;
        // ボリュームバーの位置を0に
        volumeBar.value = 0;
        // ボリュームバーの背景色を更新
        updateSlider(volumeBar, bgc, color);
        muteBtn.classList.add('muted');
        muteBtn.setAttribute('aria-label', 'Unmute');
      }
    });
 
    // 記述されている audio 要素の muted 属性の値を反映
    if (!audio.muted) {
      audio.muted = false;
      volumeBar.value = audio.volume;
      updateSlider(volumeBar, bgc, color);
      muteBtn.classList.remove('muted');
      muteBtn.setAttribute('aria-label', 'Mute');
    } else {
      audio.muted = true;
      volumeBar.value = 0;
      updateSlider(volumeBar, bgc, color);
      muteBtn.classList.add('muted');
      muteBtn.setAttribute('aria-label', 'Unmute');
    }
 
    // ミュート状態の変更を検出
    // 独自コントロールと audio 要素のコントロールを同期するための処理
    audio.addEventListener('volumechange', (e) => {
      // ボリュームが変更されてミュート状態であれば
      if (e.currentTarget.muted) {
        // ボリュームバーの値を0に
        volumeBar.value = 0;
        // ボリュームバーの背景色を更新
        updateSlider(volumeBar, bgc, color);
        muteBtn.classList.add('muted');
        muteBtn.setAttribute('aria-label', 'Unmute');
      } else {
        // ボリュームバーの値を現在の volue の値に
        volumeBar.value = audio.volume;
        // ボリュームバーの背景色を更新
        updateSlider(volumeBar, bgc, color);
        muteBtn.classList.remove('muted');
        muteBtn.setAttribute('aria-label', 'Mute');
      }
    }, false);
 
    // シークバー（再生位置を表すレンジ入力欄のスライダー）
    const seekBar = audioPlayer.querySelector('input[name="seek"]');
    // シークバーの値が変更されたら
    seekBar.addEventListener('input', (e) => {
      //再生位置を変更された値に更新
      audio.currentTime = e.currentTarget.value;
    });
 
    // 再生時間（音声データの長さ）
    let duration;
    // メタデータの読み込みが完了した時点（loadedmetadata）で再生時間を取得
    audio.addEventListener('loadedmetadata', () => {
      duration = audio.duration;
      // 再生時間を hh:mm:ss に変換して表示
      durSpan.textContent = secToHMS(Math.floor(duration));
      // シークバー（レンジ入力欄）の max 属性に再生時間を設定
      seekBar.setAttribute('max', Math.floor(duration));
    });
 
    // currentTime プロパティの値が更新される際のリスナーの登録
    audio.addEventListener('timeupdate', updateTime, false);
    function updateTime() {
      const cTime = audio.currentTime;
      // 現在の再生位置（時間）の表示を更新
      ctSpan.textContent = secToHMS(Math.floor(cTime));
      // シークバーの現在の再生位置を更新
      seekBar.value = cTime;
      // シークバーの塗り色を更新
      updateSlider(seekBar, bgc, color);
    }
 
    // トグルボタンのクリックイベントのリスナーの登録
    toggleBtn.addEventListener('click', togglePlayPause, false);
    function togglePlayPause() {
      // 停止中であれば
      if (audio.paused) {
        // 再生用関数 playAudio() を呼び出す
        playAudio();
      } else {
        // 再生中であれば停止（ボタンのラベルと背景色は pause イベントで変更）
        audio.pause();
      }
    }
 
    // 音声データを再生する関数（Async Function）
    async function playAudio() {
      try {
        // await を指定（Promise が確定するまで待つ）
        await audio.play();
        // Promise が解決されたらボタンの aria-label の値を変更し、クラスを追加
        toggleBtn.classList.add('playing');
        toggleBtn.setAttribute('aria-label', 'Pause');
      } catch (err) {
        // 再生が失敗し、クラスが追加されていればクラスを削除
        toggleBtn.classList.remove('playing');
        // コンソールにエラーを出力
        console.warn(err)
      }
    }
 
    // pause イベントのリスナー（ボタンのラベルと背景色を変更）
    audio.addEventListener('pause', () => {
      toggleBtn.classList.remove('playing');
      toggleBtn.setAttribute('aria-label', 'Play');
    });
 
    // play イベントのリスナー（ボタンのラベルと背景色を変更）
    // 独自コントロールと audio 要素のコントロールを同期するための処理
    audio.addEventListener('play', (e) => {
      toggleBtn.classList.add('playing');
      toggleBtn.setAttribute('aria-label', 'Pause');
    });
 
    // 再生終了時に発火する ended イベントのリスナー登録
    audio.addEventListener('ended', audioEnded, false);
    function audioEnded() {
      toggleBtn.classList.remove('playing');
      toggleBtn.setAttribute('aria-label', 'Play');
      // 再生位置を先頭に戻す場合は以下のコメントを外す
      //audio.currentTime = 0;
    }
 
    // ボリュームと再生位置のレンジスライダー（レンジ入力欄の背景色を設定）を取得
    const rangeSliders = audioPlayer.querySelectorAll('.range-slider');
    // レンジスライダーの input イベントに別途定義した関数 updateSlider を設定
    rangeSliders.forEach((slider) => {
      slider.addEventListener('input', (e) => {
        // 背景色を更新
        updateSlider(e.target, bgc, color);
      });
      // 初期状態に現在の状態での背景色を反映
      updateSlider(slider, bgc, color);
    });
  };
 
  /**
   * 秒数を引数に受け取り hh:mm:ss に変換する関数
   * @param {Number}  seconds 秒数
   */
  function secToHMS(seconds) {
    const hour = Math.floor(seconds / 3600);
    const min = Math.floor(seconds % 3600 / 60);
    const sec = seconds % 60;
    let hh;
    if (hour < 100) {
      hh = (`00${hour}`).slice(-2);
    } else {
      hh = hour;
    }
    const mm = (`00${min}`).slice(-2);
    const ss = (`00${sec}`).slice(-2);
    let time = '';
    if (hour !== 0) {
      time = `${hh}:${mm}:${ss}`;
    } else {
      time = `${mm}:${ss}`;
    }
    return time;
  }
 
  /**
  * レンジスライダーのトラックの塗りの範囲と色を更新する関数
  * @param {HTMLElement}  slider レンジスライダー（input type="range"）
  * @param {String}  bgc ベースとなるトラックの背景色（デフォルト #ccc）
  * @param {String}  color 変化する領域（ツマミの左側）の背景色（デフォルト #8ea8f9）
  */
  function updateSlider(slider, bgc = '#ccc', color = '#8ea8f9') {
    if (!slider.max) {
      slider.max = 100;
    }
    const progress = (slider.value / slider.max) * 100;
    slider.style.background = `linear-gradient(to right, ${color} ${progress}%, ${bgc} ${progress}%)`;
  }
 
  /**
  * プレーヤーが開始されると、他のプレーヤーを一時停止させる関数
  * @param {String}  selector audio 要素の CSS セレクタ名（デフォルト audio 要素）
  */
  function pauseOtherAudioPlayers(selector = 'audio') {
    // ドキュメントの play イベント
    document.addEventListener('play', (e) => {
      // 全ての selector で指定された要素を取得
      const audios = document.querySelectorAll(selector);
      // それぞれの audio 要素で以下を実行
      audios.forEach((audio) => {
        // audio が存在しない場合やそれが audio 要素でなければ終了（audio 要素とは限らない）
        if (!audio || audio.tagName !== 'AUDIO') {
          return;
        }
        // play イベントが発生した要素が自身でなければ停止
        if (audio !== e.target) {
          audio.pause();
        }
      });
    }, true);
  }
 
  //プレーヤーを開始すると、他のプレーヤーを一時停止（不要であれば以下をコメントアウトまたは削除）
  pauseOtherAudioPlayers()
});
