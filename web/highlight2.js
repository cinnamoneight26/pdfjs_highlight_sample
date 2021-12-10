window.onload = function () {
    var _uuid;

    // TEXT HIGHTLIGHT
    var hltr = new TextHighlighter(document.body, {
        onAfterHighlight: function (range, hlts) {
            serialized = hltr.serializeHighlights();
            saveLocalstorage(serialized);
        }
    }), serialized;

    // 삭제 시 text내용도 지워줘야 함
    // 단일 지우기
    $(document).on('click', '.highlighted', function (e) {
        var item = $(this).attr('class').replace('highlighted ', '');
        var target = $('.' + item);
        var length = target.length;
        for (var i = 0; i < length; i++) {
            hltr.removeHighlights(target[i]);
        }
        serialized = hltr.serializeHighlights();
        saveLocalstorage(serialized);

        // 스토리지에서 value 체크
        var _data = localStorage.getItem(PDFFILENAME);
        
        if (_data) {
            if (_data == '[]') {
                localStorage.removeItem(PDFFILENAME);
            }
        }

        // console.log('[Remove Target highlight]');
    });

    // 전체 지우기
    $(document).on('click', '#clearHl', function () {
        serialized = hltr.serializeHighlights();
        // console.log(serialized)
        hltr.removeHighlights();

        // serialized 초기화
        serialized = [];

        // localstorage remove
        localStorage.removeItem(PDFFILENAME);

        // console.log('[Remove All highlight]')
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
        // 스토리지에서 value 체크
        var _data = localStorage.getItem(PDFFILENAME);

        // localstorage가 있으면 해당 자료 보여줌
        if ( _data == '[]' || _data ==  null) {
            await searchingArray();
            console.log("Load Search Array");
        } else {
            await localStorageGetItem();
            console.log("Load Localstorage");
        }
    }

    // 강제로 검색 결과 표시
    setTimeout(function () {
        try {
            main();
        } catch (error) {
            console.warn("진행할 수 없습니다. error: ", error);
        }
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


    // ----------------------------------------------------------------------------- //

    async function searchingArray() {
        // console.log(window.PDFViewerApplication)

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
    // $(document).on('mousedown', '.page', function () {
    //     SELECTEDPAGE = $(this).attr('data-page-number');
    // });

    $(document).on('mousewheel', 'body', function () {
        hltr.deserializeHighlights(serialized);
    });

    // 검색 입력 이벤트
    async function searchKeyword(keyword) {
        await bindEvent(keyword);
    };


    async function bindEvent(keyword) {
        // console.log("bindEvent event");
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
            await makeHighlightSpan();

            setTimeout(function() {
                // 역직렬화
                // console.log(serialized)
                hltr.deserializeHighlights(serialized);
            }, 500);

        } catch (error) {
            return 'fail...';
        }
    };

    async function makeHighlightSpan() {
        setTimeout(function() {
            if ( !$('span.selected').hasClass('middle') && !$('span.selected').hasClass('end')) {
                console.log("middle 없음");
                return;
            } else {
                // begin, end 클래스 정리
                _uuid = makeUUID();
                var begin_html = '';
                var findBeginClass = $('.textLayer .highlight.begin');
                var getBeginText = findBeginClass.text();
                begin_html += '<span class="highlight selected '+_uuid+'">' + getBeginText + '</span>';
                $('.textLayer .highlight.begin').parent().html(begin_html);
                var end_html = '';
                var findEndClass = $('.textLayer .highlight.end');
                var getEndText = findEndClass.text();
                end_html += '<span class="highlight selected '+_uuid+'">' + getEndText + '</span>';
                $('.textLayer .highlight.end').parent().html(end_html);

                // middle 클래스 길이
                var middleSpanLength = $('span.middle').length;
                // console.log('middleSpanLength :', middleSpanLength);
        
                for (var i = 0; i < middleSpanLength; i++) {
                    var _html = '';
                    // middle 클래스 텍스트
                    var _text = $('span.middle')[i].innerText;
                    // 텍스트 뽑아내서 html 새로 생성
                    _html += '<span class="highlight selected">' + _text + '</span>';
                    // 생성한 html을 자식요소로 append
                    // $('span.middle')[i].innerHTML = _html;
                    document.getElementsByClassName('middle')[i].innerHTML = _html;
                }
        
                // console.log( $('span.middle')[i] )
                // 부모의 class는 모두 지워준다
                $('span.middle.highlight.selected').removeClass('highlight middle selected');

                findSearchResultSelectionHighlight();
            }
        }, 1000)
    };

    async function findSearchResultSelectionHighlight() {
        setTimeout(function () {
            // 검색 결과 개수 구하기
            var searchResultLengt = $('.highlight').length;

            // console.log('searchResultLengt :', searchResultLengt);

            if (searchResultLengt == 0) {
                findSearchResultSelectionHighlight();
                return;
            };

            // // 검색 결과 위치값 저장 - 배열에 오브젝트 형태로.
            for (var i = 0; i < searchResultLengt; i++) {
                // 단어일 때와 문장일 때 정보가 달라져서 분기해야 함 : 단어 안 해도 됨. 대체로 문장으로 사용
                var _thisText = $('span.highlight')[i].innerHTML;
                var _thisWidth = $('span.highlight')[i].getBoundingClientRect().width;
                var _thisHeigt = $('span.highlight')[i].getBoundingClientRect().height;

                // 해당 위치에 highlighted 생성
                var el = document.createElement('span');
                el.setAttribute('class', 'highlighted '+_uuid)
                el.setAttribute('style', 'position: absolute; cursor : pointer; background-color: ' + SELECTHIGHLIGHTCOLOR + ';' +
                    'width:' + _thisWidth + 'px; height:' + _thisHeigt + 'px;' +
                    'display:table;');
                el.setAttribute('data-highlighted', 'true');
                el.setAttribute('data-timestamp', new Date().getTime());
                el.innerText = _thisText;

                $('.highlight')[i].parentElement.appendChild(el);

                // console.log(el)
            };

            // 직렬화
            serialized = hltr.serializeHighlights();
            // console.log(serialized)

            // 기존 검색 결과 표시 삭제
            // $('.highlight').removeClass('highlight');
            $('.highlight').remove();
        }, 200);
    };

    function makeUUID() {
        function s4() { return ((1 + Math.random()) * 0x10000 | 0).toString(16).substring(1); }
        return s4() + s4() + '_' + s4() + '_' + s4() + '_' + s4() + '_' + s4() + s4() + s4()
    };

    function saveLocalstorage(serialized) {
        var _data = serialized;
        var key = PDFFILENAME;
        // console.log("--- setLocalstorage  ---")
        localStorage.setItem(key, _data);
    };

    async function localStorageGetItem() {
        var _data = localStorage.getItem(PDFFILENAME);
        serialized = _data;

        setTimeout(function() {
            try {
                hltr.deserializeHighlights(serialized);
                $("#outerContainer").LoadingOverlay("hide", true);
            } catch (error) {
                console.warn("로드할 수 없습니다. error : ", error);
            }
        }, 1000)
    };
};
