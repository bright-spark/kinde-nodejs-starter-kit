document.getElementById('parameterForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const title = document.getElementById('title').value;
    const statusbar = document.getElementById('statusbar').value;
    const keywords = document.getElementById('keywords').value;
    const subject = document.getElementById('subject').value;
    const description = document.getElementById('description').value;
    const ogurl = document.getElementById('ogurl').value;
    const ogtitle = document.getElementById('ogtitle').value;
    const ogdescription = document.getElementById('ogdescription').value;
    const ogsitename = document.getElementById('ogsitename').value;
    const frame1url = document.getElementById('frame1url').value;
    const frame2url = document.getElementById('frame2url').value;
    const frame3url = document.getElementById('frame3url').value;
    const frame4url = document.getElementById('frame4url').value;
    const frame5url = document.getElementById('frame5url').value;
    const bgcolour1 = document.getElementById('bgcolour1').value;
    const bgcolour2 = document.getElementById('bgcolour2').value;
    const bgcolour3 = document.getElementById('bgcolour3').value;
    const bgcolour4 = document.getElementById('bgcolour4').value;
    const bgcolour5 = document.getElementById('bgcolour5').value;
    const bgmenu = document.getElementById('bgmenu').value;
    const stroke = document.getElementById('stroke').value;
    const bodybgcolor = document.getElementById('bodybgcolor').value;
    const bodycolor = document.getElementById('bodycolor').value;
    const statusbgcolor = document.getElementById('statusbgcolor').value;
    const statuscolor = document.getElementById('statuscolor').value;
    const pwaname = document.getElementById('pwaname').value;
    const pwashortname = document.getElementById('pwashortname').value;
    const pwadescription = document.getElementById('pwadescription').value;
    const pwatheme = document.getElementById('pwatheme').value;
    const pwabackground = document.getElementById('pwabackground').value;
    const pwanavigation = document.getElementById('pwanavigation').value;
    const pwaorientation = document.getElementById('pwaorientation').value;
    const pwadisplay = document.getElementById('pwadisplay').value;
    const pwaicons = document.getElementById('pwaicons').value;
    const pwastarturl = document.getElementById('pwastarturl').value;
    const pwascopes = document.getElementById('pwascopes').value;
    const pwashortcuts = document.getElementById('pwashortcuts').value;
    const pwadisplayoverride = document.getElementById('pwadisplayoverride').value;
    const androidid = document.getElementById('androidid').value;
    const pwacategories = document.getElementById('pwacategories').value;
    
    // Construct the payload
    const payload = {

        title: title,
        statusbar: statusbar,
        keywords: keywords,
        subject: subject,
        description: description,
        ogurl: ogurl,
        ogtitle: ogtitle,
        ogdescription: ogdescription,
        ogsitename: ogsitename,
        frame1url: frame1url,
        frame2url: frame2url,
        frame3url: frame3url,
        frame4url: frame4url,
        frame5url:frame5url ,
        bgcolour1: bgcolour1,
        bgcolour2: bgcolour2,
        bgcolour3: bgcolour3,
        bgcolour4: bgcolour4,
        bgcolour5: bgcolour5,
        bgmenu: bgmenu,
        stroke: stroke,
        bodybgcolor: bodybgcolor,
        bodycolor: bodycolor,
        statusbgcolor: statusbgcolor,
        statuscolor: statuscolor,
        pwaname: pwaname,
        pwashortname: pwashortname,
        pwadescription: pwadescription,
        pwatheme: pwatheme,
        pwabackground: pwabackground,
        pwanavigation: pwanavigation,
        pwaorientation: pwaorientation,
        pwadisplay: pwadisplay,
        pwaicons: pwaicons,
        pwastarturl: pwastarturl,
        pwascopes: pwascopes,
        pwashortcuts: pwashortcuts,
        pwadisplayoverride: pwadisplayoverride,
        androidid: androidid,
        pwacategories: pwacategories

    };

      // Make the API call
      fetch('/generate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    })
    .then(response => response.text())
    .then(data => {
        alert(data);

        // Update baseUrl within this block
        baseUrl = '/app';
        window.open(baseUrl, '_parent');
    })
    .catch((error) => {
        console.error('Error:', error);
    });
});

