window.onload = function () {
    // colorpicker
    $("#selectcolor").spectrum({
        color: '#00f',
        showPaletteOnly: true,
        showInitial: false,
        showAlpha: false,
        showPalette: true,
        clickoutFiresChange: false,
        hideAfterPaletteSelect:true,
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
    
    function getSelectionCoords() {
        // selection에 문자열이 비어 있는 경우 return
        var get_selection = document.getSelection().toString();

        console.log(get_selection);

        let pageIndex = parseInt(SELECTEDPAGE);
        // let pageIndex = window.PDFViewerApplication.page;
        
        let selectedPromise = window.PDFViewerApplication.pdfDocument.getPage( pageIndex ).then((_page) => {
            // --- canvas의 index로 표시하려 하였으나 10페이지 전후의 canvas는 사라짐
            // var canvasTarget = document.getElementsByTagName('canvas')[pageIndex-1];

            var _thisPage = _page._pageIndex;
            var _thisViewPage = $("#viewer .page").eq(_thisPage);
            // var _thisViewPage = $("#viewer .page").eq(_thisPage);
            var canvasTarget = _thisViewPage.find('canvas')[0];     
            
            
            let pageRect = null;
            
            try {
                pageRect = canvasTarget.getClientRects()[0];
            } catch (error) {
                console.log('[error] canvasTarget :', canvasTarget);
                return;
            };

            let selectionRects = window.getSelection().getRangeAt(0).getClientRects();
            var _scale = window.PDFViewerApplication.pdfViewer._currentScale;
            let viewport = _page.getViewport({ 'scale': _scale });
            // let viewport = _page.getViewport({ scale: myState.scale });
            let selectionRectsList = Object.values(selectionRects);

            let selected = selectionRectsList.map(function (r) {
                return viewport.convertToPdfPoint(r.left - pageRect.x, r.top - pageRect.y).concat(
                    viewport.convertToPdfPoint(r.right - pageRect.x, r.bottom - pageRect.y));
            });
            return selected;
        });
        return { pageIndex: pageIndex, coordsPromise: selectedPromise };
    }

    function showHighlight() {
        var { pageIndex, coordsPromise } = getSelectionCoords();
        window.PDFViewerApplication.pdfDocument.getPage(pageIndex).then((page) => {
        // myState.pdfDoc.getPage(pageIndex).then((page) => {
            var _scale = window.PDFViewerApplication.pdfViewer._currentScale;
            var viewport = page.getViewport({ 'scale': _scale });;
            // var viewport = page.getViewport({ scale: myState.scale });;
        
            coordsPromise.then((coords) => {
                try {
                    coords.forEach(function (rect) {
                        let bounds = viewport.convertToViewportRectangle(rect);
                        
                        var x1 = Math.min(bounds[0], bounds[2]);
                        var y1 = Math.min(bounds[1], bounds[3]);
                        var width = Math.abs(bounds[0] - bounds[2]);
                        var hight = Math.abs(bounds[1] - bounds[3]);
    
                        if (x1 == 0 || y1 == 0 || width == 0 || hight== 0) {
                            return false;
                        }
    
                        var el = createRectDiv([x1, y1, width, hight], SELECTHIGHLIGHTCOLOR);
                        var _thisPage = page._pageIndex;
                        var _thisViewPage = $("#viewer .page").eq(_thisPage);
                        var target = _thisViewPage.find('.textLayer')[0];;
                        target.appendChild(el);
                    });
                } catch (error) {
                    console.log('[error] coords :', coords);
                    return;
                }
            });
        });
    };

    function createRectDiv(boundBox, SELECTHIGHLIGHTCOLOR) {
        var el = document.createElement('div');
        el.setAttribute('class', 'hiDiv')
        el.setAttribute('style', 'position: absolute; background-color: ' + SELECTHIGHLIGHTCOLOR + '; opacity: 0.9;' +
            'left:' + boundBox[0] + 'px; top:' + boundBox[1] + 'px;' +
            'width:' + boundBox[2] + 'px; height:' + boundBox[3] + 'px;');
        return el;
    };

    window.addEventListener('mouseup', function () {
        var length = window.getSelection().toString().length;
        if (length > 0) {
            // console.log(window.PDFViewerApplication)
            showHighlight();
        } else {
            // Clear All ?!
        }
    });

    // 마우스 다운 했을 때 페이지 저장
    $(document).on('mousedown','.page', function () {
        SELECTEDPAGE = $(this).attr('data-page-number');
    });

    // 클릭 영역만 지우기
    $(document).on('click', 'div.hiDiv', function() {
        $(this).remove();
    });

    // 전체 지우기
    $(document).on('click', '#clearHl', function () {
        clearHighlight();
    });

    // 직접 선택한 하이라이트 영역 모두 삭제
    function clearHighlight() {
        $('div.hiDiv').remove();
        selectedCancle();
    };

    var test = null;
    // 강제로 검색 결과 표시
    setTimeout(function() {
        // 검색 결과 모두 표시 클릭
        if (TESTKEYWORDARRAY != "") {
            
            // 검색 결과 배열로 처리
            TESTKEYWORDARRAY.forEach(function (keyword) {
                // TESTKEYWORD = keyword;
                searchKeyword(keyword)
                test = setInterval(searchKeyword(keyword),1000);
                
                // console.log(TESTKEYWORD)
                // $('#findHighlightAll').click();
                // searchPDF(TESTKEYWORD);
                // 검색 결과 하이라이트 지정
                // setTimeout(() => {
                //     if ( $('.highlight').hasClass('selected')) {
                //         $('.highlight').removeClass('selected');
                //     }
                    
                //     // moveToFirstPage();
                    
                //     // console.log( window.PDFViewerApplication );
                //     findSearchResultSelectionHighlight();
        
                //     console.log('settimeout 500')
                // }, 500);
            });
            clearInterval(test);
        } 
        console.log('settimeout 1000')
    }, 1000);    

    // 검색 입력 이벤트
    function searchKeyword(keyword) {
        TESTKEYWORD = keyword;
        $('#findHighlightAll').click();

        setTimeout(() => {
            if ( $('.highlight').hasClass('selected')) {
                $('.highlight').removeClass('selected');
            }
            
            // moveToFirstPage();
            
            // console.log( window.PDFViewerApplication );
            findSearchResultSelectionHighlight();

            console.log('settimeout 500')
        }, 500);
    };

    // 첫 페이지로 이동
    function moveToFirstPage() {
        window.PDFViewerApplication.page = 1;
    };

    // selection 취소
    function selectedCancle() {
        if (window.getSelection) {
            if (window.getSelection().empty) {  // Chrome
                window.getSelection().empty();
            } else if (window.getSelection().removeAllRanges) {  // Firefox
                window.getSelection().removeAllRanges();
            }
        } else if (document.selection) {  // IE?
            document.selection.empty();
        }
    };

    // 검색 기능 
    function searchPDF(td_text) {
        window.PDFViewerApplication.findBar.open();
        window.PDFViewerApplication.findBar.findField.value = td_text;
        window.PDFViewerApplication.findBar.caseSensitive.checked = true;
        window.PDFViewerApplication.findBar.highlightAll.checked = true;
        window.PDFViewerApplication.findBar.findNextButton.click();
        window.PDFViewerApplication.findBar.close();
    };

    // TODO : 검색 결과에 hiDiv 씌워주고 selection 취소
    function findSearchResultSelectionHighlight() {
        // span 정리 - 두개로 나뉘어진 span을 찾아서 정리
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

        // 검색 결과 개수 구하기
        var searchResultLengt = $('.highlight').length;
        // 검색 결과 위치값 저장 - 배열에 오브젝트 형태로.

        // console.log("searchResultLengt : ", searchResultLengt)

        for (var i = 0; i < searchResultLengt; i++) {

            // 단어일 때와 문장일 때 정보가 달라져서 분기해야 함 : 단어 안 해도 됨. 대체로 문장으로 사용
            var _thisWidth = $('.highlight')[i].getBoundingClientRect().width;
            var _thisHeigt = $('.highlight')[i].getBoundingClientRect().height;
            var _thisLeft = parseInt($('.highlight')[i].style.left);
            var _thisTop = parseInt($('.highlight')[i].style.top);

            // console.log($('.highlight')[i])

            // 해당 위치에 HiDiv 생성
            var el = document.createElement('div');
            el.setAttribute('class', 'hiDiv')
            el.setAttribute('style', 'position: absolute; background-color: ' + SELECTHIGHLIGHTCOLOR + '; opacity: 0.3;' +
                'left:' + _thisLeft + 'px; top:' + _thisTop + 'px;' +
                'width:' + _thisWidth + 'px; height:' + _thisHeigt + 'px;');
            $('.highlight')[i].parentElement.parentElement.appendChild(el);
        };
        // 기존 검색 결과 표시 삭제
        $('.highlight').removeClass('highlight');

    };
};
