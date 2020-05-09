$(document).ready(function () {

    function Section() {
        this.title = "";
        this.items = [];
    }

    const md = window.markdownit();
    let sections = [];
    let curSection = 0;

    const $markdownInput = $("#markdownInput");
    const $stepper = $("#stepper");
    const $prevButton = $("#prevButton");
    const $nextButton = $("#nextButton");

    function setCurSection() {
        const hash = window.location.hash.slice(1);
        curSection = Number(hash) || 0;
    }

    function updateSections() {
        sections = [];

        const parsed = md.parse($markdownInput.val(), {});

        let headingOpen = false;
        let sectionOpen = false;
        let section = new Section();

        parsed.forEach(function (item) {
            if (item.type === "heading_open" && item.tag === "h1") {
                if (sectionOpen) {
                    sections.push(section);
                }
                section = new Section();
                headingOpen = true;
                sectionOpen = true;
            }

            if (headingOpen && item.type === "inline" && item.tag === "") {
                section.title = item.content;
            }

            if (item.type === "heading_close" && item.tag === "h1") {
                headingOpen = false;
            }

            section.items.push(item);
        });

        if (sectionOpen) {
            sections.push(section);
        }

        if (curSection > sections.length - 1) {
            curSection = sections.length - 1;
        }
    }

    function updateStepper() {
        $stepper.html('');
        sections.forEach(function (section, idx) {
            const number = '<span class="circle">' + (idx + 1) + '</span>';
            const label = '<span class="label">' + section.title + '</span>';
            const link = '<a href="#' + idx + '">' + number + label + '</a>';
            let liClass = '';
            let content = '';
            if (idx < curSection) {
                liClass = 'completed';
            } else if (idx === curSection) {
                liClass = 'active';
                const rendered = md.renderer.render(sections[curSection].items, {}, {});
                content = '<div class="step-content">' + rendered + '</div>';
            }
            const li = '<li id="section' + idx + '" class="' + liClass + '">' + link + content + '</li>';
            $stepper.append(li);
        });
    }

    function scrollToCurSection() {
        $('#stepperWrapper').scrollTo($('#section' + curSection));
    }

    function updateButtons() {
        if (curSection > 0) {
            $prevButton.show();
        }
        else {
            $prevButton.hide();
        }

        if (curSection < sections.length - 1) {
            $nextButton.show();
        } else {
            $nextButton.hide();
        }
    }

    function updateAll() {
        setCurSection();
        updateSections();
        updateStepper();
        updateButtons();
        scrollToCurSection();
    }

    $prevButton.click(function () {
        if (curSection > 0) {
            window.location.hash = '#' + (curSection - 1);
        }
    });

    $nextButton.click(function () {
        if (curSection < sections.length - 1) {
            window.location.hash = '#' + (curSection + 1);
        }
    });

    $(window).bind('hashchange', function () {
        updateAll();
    });

    $markdownInput.on("keyup paste", function () {
        updateAll();
    });

    updateAll();
});