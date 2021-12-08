window.onload = function () {
    var _uuid;

    // TEXT HIGHTLIGHT
    var hltr = new TextHighlighter(document.body), serialized;

    // 단일 지우기
    $(document).on('click', '.highlighted', function (e) {
        var item = $(this).attr('class').replace('highlighted ','');
        console.log('item : ', item)
        var target = $('.'+item);
        var length = target.length;
        console.log('length : ', length)
        for (var i = 0; i < length; i++) {
            console.log(target[i])
            hltr.removeHighlights(target[i]);
        }
        console.log('[remove target highlight]');
        // console.log(e.target)
        // hltr.removeHighlights(e.target);
    });

    // 전체 지우기
    $(document).on('click', '#clearHl', function () {
        serialized = hltr.serializeHighlights();
        // console.log(serialized)
        hltr.removeHighlights();
        console.log('[remove highlight]')
    });

    $("#outerContainer").LoadingOverlay("show", loading_overlay_default);

    var loading_overlay_default =
    {
        background: "rgba(255, 255, 255, 0.1)",
        image: "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1000 1000'><circle r='80' cx='500' cy='90'/><circle r='80' cx='500' cy='910'/><circle r='80' cx='90' cy='500'/><circle r='80' cx='910' cy='500'/><circle r='80' cx='212' cy='212'/><circle r='80' cx='788' cy='212'/><circle r='80' cx='212' cy='788'/><circle r='80' cx='788' cy='788'/></svg>",
        imageAnimation: "2000ms rotate_right",
        // imageAutoResize         : true,
        imageResizeFactor: 0.2,
        imageColor: "#00cbb4"
    };

    async function main() {
        return await searchingArray();
        // await searchingArray();
    }

    // 강제로 검색 결과 표시
    setTimeout(function () {
        main();
    }, 1000);

    // colorpicker
    $("#selectcolor").spectrum({
        color: '#c00',
        showPaletteOnly: true,
        showInitial: false,
        showAlpha: false,
        showPalette: true,
        clickoutFiresChange: false,
        hideAfterPaletteSelect: true,
        palette: [
            ["#f00", "#f90", "#ff0", "#0f0", "#0ff", "#00f", "#90f", "#f0f"],
            ["#e06666", "#f6b26b", "#ffd966", "#93c47d", "#76a5af", "#6fa8dc", "#8e7cc3", "#c27ba0"],
            ["#c00", "#e69138", "#f1c232", "#6aa84f", "#45818e", "#3d85c6", "#674ea7", "#a64d79"],
            ["#900", "#b45f06", "#bf9000", "#38761d", "#134f5c", "#0b5394", "#351c75", "#741b47"],
            ["#600", "#783f04", "#7f6000", "#274e13", "#0c343d", "#073763", "#20124d", "#4c1130"]
        ],
        cancelText: "",
        chooseText: "선택",
        hide: function (color) {
            SELECTHIGHLIGHTCOLOR = color.toRgbString();
            document.getElementById('selectcolor').style.backgroundColor = SELECTHIGHLIGHTCOLOR;
        }
    });

    // window.addEventListener('mouseup', function () {
    //     var length = window.getSelection().toString().length;
    //     if (length > 0) {
    //         // console.log(window.PDFViewerApplication)
    //         showHighlight();
    //     } else {
    //         // Clear All ?!
    //     }
    // });
    // ----------------------------------------------------------------------------- //

    async function searchingArray() {
        console.log(window.PDFViewerApplication)
        if (TESTKEYWORDARRAY != "") {
            // 검색 결과 배열로 처리
            for (let i = 0; i < TESTKEYWORDARRAY.length; i++) {
                setTimeout(function timer() {
                    // 검색 결과 하이라이트 지정
                    searchKeyword(TESTKEYWORDARRAY[i]);
                    console.log(TESTKEYWORDARRAY[i])
                }, i * 1000);
            }
            setTimeout(function () {
                $("#outerContainer").LoadingOverlay("hide", true);
            }, TESTKEYWORDARRAY.length * 1000);
        }
    };

    // 마우스 다운 했을 때 페이지 저장
    $(document).on('mousedown', '.page', function () {
        SELECTEDPAGE = $(this).attr('data-page-number');
    });

    // 검색 입력 이벤트
    async function searchKeyword(keyword) {
        console.log("searchKeyword event");
        // TESTKEYWORD = keyword;
        await bindEvent(keyword);
    };


    async function bindEvent(keyword) {
        console.log("bindEvent event");
        // console.log( window.PDFViewerApplication.findBar)

        try {
            if (typeof window.PDFViewerApplication.findController !== 'undefined') {
                window.PDFViewerApplication.findBar.open();
                $(window.PDFViewerApplication.findBar.findField).val(keyword);
                PDFViewerApplication.findController.executeCommand('find', {
                    query: keyword,
                    phraseSearch: false,
                    caseSensitive: false,
                    entireWord: false,
                    highlightAll: true,
                    findPrevious: undefined,
                });
                window.PDFViewerApplication.findBar.dispatchEvent('');
                _uuid = makeUUID();
            }
            // $('#findHighlightAll').click();
            await findSearchResultSelectionHighlight();

        } catch (error) {
            return 'fail...T_T';
        }
    };

    async function findSearchResultSelectionHighlight() {
        setTimeout(function () {
            // // 검색 결과 개수 구하기
            var searchResultLengt = $('.highlight').length;
            
            if (searchResultLengt == 0) {
                findSearchResultSelectionHighlight();
                return;
            };

            // span 정리 - 두개로 나뉘어진 span을 찾아서 정리
            if ($('.highlight').hasClass('selected')) {
                $('.highlight').removeClass('selected');
            }
            // begin, end 클래스가 있는지 찾기
            var findBeginClass = $('.textLayer .highlight.begin');
            // 해당 클래스에 있는 text를 일단 저장
            var getBeginText = findBeginClass.text();
            // 부모 span에 highlight, appended 클래스 추가
            findBeginClass.parent().addClass('highlight');
            // 저장한 텍스트를 부모 span에 저장
            findBeginClass.parent().text(getBeginText);

            var findEndClass = $('.textLayer .highlight.end');
            var getEndText = findEndClass.text();
            findEndClass.parent().addClass('highlight');
            findEndClass.parent().text(getEndText);

            // 검색 결과 위치값 저장 - 배열에 오브젝트 형태로.
            console.log("searchResultLengt : ", searchResultLengt)

            
            for (var i = 0; i < searchResultLengt; i++) {
                // 단어일 때와 문장일 때 정보가 달라져서 분기해야 함 : 단어 안 해도 됨. 대체로 문장으로 사용
                var _thisWidth = $('.highlight')[i].getBoundingClientRect().width;
                var _thisHeigt = $('.highlight')[i].getBoundingClientRect().height;
                var _thisLeft = parseInt($('.highlight')[i].style.left);
                var _thisTop = parseInt($('.highlight')[i].style.top);
                var _thisText = $('.highlight')[i].innerHTML;

                // 해당 위치에 highlighted 생성
                var el = document.createElement('span');
                el.setAttribute('class', 'highlighted '+_uuid)
                el.setAttribute('style', 'position: absolute; cursor : pointer; background-color: ' + SELECTHIGHLIGHTCOLOR + ';' +
                    'left:' + _thisLeft + 'px; top:' + _thisTop + 'px;' +
                    'width:' + _thisWidth + 'px; height:' + _thisHeigt + 'px;');
                el.setAttribute('data-highlighted', 'true');
                el.setAttribute('data-timestamp', new Date().getTime());
                el.innerText = _thisText;
                
                // el.setAttribute('class', _uuid);
                // el.setAttribute('data-item', _uuid);
                $('.highlight')[i].parentElement.appendChild(el);
            };
            // 기존 검색 결과 표시 삭제
            $('.highlight').removeClass('highlight');
        }, 100);
    };

    function makeUUID() {
        function s4() { return ((1 + Math.random()) * 0x10000 | 0).toString(16).substring(1); }
        return s4() + s4() + '_' + s4() + '_' + s4() + '_' + s4() + '_' + s4() + s4() + s4()
    }
};