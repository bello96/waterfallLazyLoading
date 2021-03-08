/* 获取任意元素距离BODY的偏移 */
const offset = element => {
    let parent = element.offsetParent, // 获取该元素的最近定位父元素，如果其父元素中不存在定位则为body
        top = element.offsetTop, // 该元素相对于其offsetParent元素的顶部内边距的距离
        left = element.offsetLeft; // 该元素左上角相对于offsetParent元素的左边界距离
    while (parent) {
        left += parent.clientLeft; // 该元素左边框的宽度
        left += parent.offsetLeft;
        top += parent.clientTop; // 该元素上边框的宽度
        top += parent.offsetTop;
        parent = parent.offsetParent;
    }
    return { top, left };
};

/* 函数节流 */
const throttle = function throttle(func, wait = 500) {
    let previous = 0,
        timer = null;
    return function anonymous(...params) {
        let now = +new Date(),
            remaining = wait - (now - previous);
        if (remaining <= 0) {
            clearTimeout(timer);
            timer = null;
            previous = now;
            func.call(this, ...params);
        } else if (!timer) {
            timer = setTimeout(() => {
                clearTimeout(timer);
                timer = null;
                previous = +new Date();
                func.call(this, ...params);
            }, remaining);
        }
    };
};

(async function () {
    // 获取3列图片大容器
    let columns = Array.from(document.querySelectorAll('.column'));
    // 默认占位图
    let imgDefalutSrc = './../images/default.png'
    // 获取数据
    const queryData = () => fetch('/data.json').then(res => res.json());
    // 数据绑定「瀑布流效果实现」
    const binding = data => {
        let newData = data.map(item => {
            // 等比处理图片宽高
            let { width, height } = item;
            item.width = 230;
            item.height = height / (width / 230);
            return item;
        });
        for (let i = 0; i < newData.length; i += 3) {
            // 截取三个元素
            let group = newData.slice(i, i + 3);
            // 按照高度从小到大排序columns三个大容器
            columns.sort((a, b) => b.offsetHeight - a.offsetHeight);
            // 按照每个图片高度从小到大排序group中的图片
            group.sort((a, b) => a.height - b.height);
            group.forEach((item, index) => {
                let { height, title, pic, link } = item;
                let card = document.createElement('div');
                card.className = "card";
                card.innerHTML = `<a href="${link}" target="_blank">
                    <div class="lazyImageBox" style="height:${height}px">
                        <img src='${imgDefalutSrc}' alt="" data-image="${pic}">
                    </div>
                    <p>${title}</p>
                </a>`;
                columns[index].appendChild(card);
            });
        }
    };
    // 第一次加载页面
    let data = await queryData();
    binding(data);


    // 延迟加载（方案一）

    // 单张图片延迟加载
    const lazyImage = imageBox => {
        let img = imageBox.querySelector('img'),
            dataImage = img.getAttribute('data-image');
        img.src = dataImage;
        img.onload = () => {
            img.style.opacity = 1;
        };
        // 处理过的盒子设置一个标志
        imageBox.setAttribute('isLoad', true);
    };
    // 图片延迟加载:盒子底边距离BODY的偏移 <= 浏览器底边距离BODY的偏移 “完全出现在视口中了”
    let winH = document.documentElement.clientHeight; // 当前视口高度
    const lazying = () => {
        let imageBoxs = Array.from(document.querySelectorAll('.lazyImageBox'));
        imageBoxs.forEach(imageBox => {
            let isLoad = imageBox.getAttribute('isLoad'); // 判断是否处理过
            if (isLoad) return;
            let B = offset(imageBox).top + imageBox.offsetHeight,
                A = winH + document.documentElement.scrollTop;
            if (B <= A) lazyImage(imageBox);
        });
    };
    // 进入界面第一次执行
    lazying();
    // 页面滚动
    window.onscroll = throttle(lazying);



    /* 延迟加载第二种方案 */
    // let observer = new IntersectionObserver(changes => {
    //     changes.forEach(item => {
    //         let { isIntersecting, target } = item;
    //         if (isIntersecting) {
    //             lazyImage(target);
    //             observer.unobserve(target);
    //         }
    //     });
    // }, {
    //     threshold: [1]
    // });
    // let imageBoxs = Array.from(document.querySelectorAll('.lazyImageBox'));
    // imageBoxs.forEach(imageBox => {
    //     observer.observe(imageBox);
    // });

})();