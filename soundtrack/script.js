document.addEventListener('DOMContentLoaded', () => {
 
  const audioControllers = document.querySelectorAll('.audio-controller');
 
  audioControllers.forEach((audioController) => {
 
    // .audio-controller 内の audio 要素を取得
    const audio = audioController.querySelector('audio');
    // 念のため controls に false を指定して確実に非表示に
    audio.controls = false;
    // 初期ボリューム（デフォルトは 1。必要に応じて変更できます）
    audio.volume = 0.8;
    // iPhone 対策
    audio.preload = 'metadata';
 
    // トグルボタン（再生・停止ボタン）
    const toggleBtn = audioController.querySelector('.toggle');
    // 現在の再生位置（時間）を表示する要素
    const ctSpan = audioController.querySelector('.time .current-time');
    // 現在の再生位置（時間）を hh:mm:ss に変換して表示
    ctSpan.textContent = secToHMS(audio.currentTime);
    // 再生時間を表示する要素
    const durSpan = audioController.querySelector('.time .duration');
 
    // ループボタン
    const loopBtn = audioController.querySelector('.loop');
    loopBtn.addEventListener('click', () => {
      // loop が有効であれば
      if (audio.loop) {
        // loop を無効にしてテキストと背景色を変更
        audio.loop = false;
        loopBtn.textContent = 'Loop'
        loopBtn.classList.remove('active');
      } else {
        // loop が無効であれば有効にしてテキストと背景色を変更
        audio.loop = true;
        loopBtn.textContent = 'Unloop'
        loopBtn.classList.add('active');
      }
    });
 
    // ボリュームスライダー
    const volumeBar = audioController.querySelector('input[name="vol"]');
    // スライダーの値に現在の volume の値（初期値）を設定
    volumeBar.value = audio.volume;
    // スライダーの値が変更されたら
    volumeBar.addEventListener('input', (e) => {
      // スライダーの値に現在の値を設定
      audio.volume = e.currentTarget.value;
      // ミュート中であればミュートを解除
      if (audio.muted) {
        audio.muted = false;
      }
    });
 
    // ミュートボタン
    const muteBtn = audioController.querySelector('.mute');
    // ミュートボタンがクリックされたら
    muteBtn.addEventListener('click', () => {
      // ミュート中であれば
      if (audio.muted) {
        // ミュートを解除
        audio.muted = false;
        // ボリュームバーの位置を更新
        volumeBar.value = audio.volume;
        // ボリュームバーのトラックの色を更新
        updateSlider(volumeBar);
        // ミュートボタンのテキストを変更
        muteBtn.textContent = 'Mute';
        // ミュートボタンの背景色を変更
        muteBtn.classList.remove('active');
      } else {
        audio.muted = true;
        volumeBar.value = 0;
        updateSlider(volumeBar);
        muteBtn.textContent = 'Unmute';
        muteBtn.classList.add('active');
      }
    });
 
    // ミュート状態の変更を検出
    // 独自コントロールと audio 要素のコントロールを同期するための処理
    audio.addEventListener('volumechange', (e) => {
      if (e.currentTarget.muted) {
        volumeBar.value = 0;
        updateSlider(volumeBar);
        muteBtn.textContent = 'Unmute';
        muteBtn.classList.add('active');
      } else {
        volumeBar.value = audio.volume;
        updateSlider(volumeBar);
        muteBtn.textContent = 'Mute';
        muteBtn.classList.remove('active');
      }
    }, false);
 
    // シークバー
    const seekBar = audioController.querySelector('input[name="seek"]');
    // シークバーの値が変更されたら
    seekBar.addEventListener('input', (e) => {
      //再生位置を変更された値に設定
      audio.currentTime = e.currentTarget.value;
    });
 
    // 再生時間（音声データの長さ）
    let duration;
    // メタデータの読み込みが完了した時点で再生時間を取得
    audio.addEventListener('loadedmetadata', () => {
      duration = audio.duration;
      // 再生時間を hh:mm:ss に変換して表示
      durSpan.textContent = secToHMS(Math.floor(duration));
      // シークバー（レンジ入力欄）の max 属性に再生時間を設定
      seekBar.setAttribute('max', Math.floor(duration));
    });
 
    // currentTime プロパティの値が更新される際に発火するイベント
    audio.addEventListener('timeupdate', updateTime, false);
 
    function updateTime() {
      const cTime = audio.currentTime;
      // 現在の再生位置（時間）の表示を更新
      ctSpan.textContent = secToHMS(Math.floor(cTime));
      // シークバーの現在の再生位置を更新
      seekBar.value = cTime;
      // シークバーの塗り色を更新
      updateSlider(seekBar);
    }
 
    // トグルボタンのクリックイベント
    toggleBtn.addEventListener('click', togglePlayPause, false);
 
    // トグルボタンのリスナー関数
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
 
    // 音声データを再生する非同期関数（Async Function）
    async function playAudio() {
      try {
        // await を指定して Promise が確定するまで待ちます
        await audio.play();
        // Promise が解決されたらボタンのテキストを変更し、クラスを追加
        toggleBtn.textContent = 'Pause';
        toggleBtn.classList.add('playing');
      } catch (err) {
        // 再生できなければ（クラスが追加されていれば）クラスを削除
        toggleBtn.classList.remove('playing');
        // コンソールにエラーを出力
        console.warn(err);
      }
    }
 
    // pause イベントのリスナー（ボタンのラベルと背景色を変更）
    audio.addEventListener('pause', () => {
      toggleBtn.textContent = 'Play';
      toggleBtn.classList.remove('playing');
    });
 
    // 再生終了時に発火するイベント
    audio.addEventListener('ended', audioEnded, false);
    // 再生終了時に呼び出す関数
    function audioEnded() {
      // ボタンのテキストを Pause から Play に変更してクラスを削除（色を変更）
      toggleBtn.textContent = 'Play';
      toggleBtn.classList.remove('playing');
      // 再生位置を先頭に戻す（必要に応じて）
      audio.currentTime = 0;
    }
 
    // レンジスライダー
    const rangeSliders = audioController.querySelectorAll('.range-slider');
 
    rangeSliders.forEach((slider) => {
      // レンジスライダーの input イベントに別途定義した関数 updateSlider を設定
      slider.addEventListener('input', (e) => {
        updateSlider(e.target);
      });
      // 初期状態に現在の状態を反映
      updateSlider(slider);
    });
 
    // play イベントのリスナー（ボタンのラベルと背景色を変更）
    // 独自コントロールと audio 要素のコントロールを同期するための処理
    audio.addEventListener('play', (e) => {
      toggleBtn.textContent = 'Pause';
      toggleBtn.classList.add('playing');
    });
  });
 
  /**
  * 秒数を引数に受け取り hh:mm:ss に変換する関数
  * @param {Number}  seconds 秒数
  */
  function secToHMS(seconds) {
    const hour = Math.floor(seconds / 3600);
    const min = Math.floor(seconds % 3600 / 60);
    const sec = seconds % 60;
    let hh;
    // 3桁未満ならゼロパディング
    if (hour < 100) {
      hh = (`00${hour}`).slice(-2);
    } else {
      hh = hour;
    }
    // mm:ss の形式にするためゼロパディング
    const mm = (`00${min}`).slice(-2);
    const ss = (`00${sec}`).slice(-2);
    let time = '';
    if (hour !== 0) {
      // 1時間以上であれば hh:mm:ss
      time = `${hh}:${mm}:${ss}`;
    } else {
      // 1時間未満であれば mm:ss
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
      // max 属性が設定されていなければ 100 を設定
      slider.max = 100;
    }
    // 現在の値から割合（%）を取得
    const progress = (slider.value / slider.max) * 100;
    // linear-gradient でトラックの背景色の領域を引数の色で更新
    slider.style.background =
      `linear-gradient(to right, ${color} ${progress}%, ${bgc} ${progress}%)`;
  }
 
  // 再生を開始すると、他に再生中のものがあれば停止（必要に応じて設定）
  /* document.addEventListener('play', (e) => {
    const audios = document.querySelectorAll('audio');
    audios.forEach((audio) => {
      if (audio !== e.target) {
        audio.pause();
      }
    });
  }, true); */
 
});
