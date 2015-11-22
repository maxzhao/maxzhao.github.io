(function () {

    var localT = this;

    var services = angular.injector(["task.services"]);

    var delay = 0;

    function queryList() {

        if ((localT.queryList || localT.eggQuest > 0)
            && localT.lockCount < 5) {
            localT.lockCount++;
            return;
        }

        localT.lockCount = 0;

        localT.queryList = true;


        services.invoke(function($api){
            $api.getTimedTaskList().then(
                function(rep){

                    if(rep.code != 200){
                        delay += 1000;
                        if(delay > 30*1000)
                            delay = 30*1000;
                    }else
                        delay = 0;

                    localT.dotNum++;
                    localT.dotNum = localT.dotNum % 5;

                    localT.iframeT.src = "http://www.tangjoy.com/shi/upload.html?key=qianka&dotNum=" + localT.dotNum + "&currentEgg=" + localT.currentEgg;

                    var citem = undefined;
                    var hasEnter = false;
                    rep.data.forEach(function (item) {
                        if(item.status == 2){
                            hasEnter = true;
                        }

                        if(!hasEnter
                            && item.status == 1
                            && item.qty > 0
                            && item.reward >= 1
                            && item.type == 1){

                            if(citem == undefined)
                                citem = item;
                            else if(item.reward > citem
                            || (item.reward==citem.reward && item.qty < citem.qty))
                                citem = item;
                        }
                    });

                    if(hasEnter || citem == undefined)
                        return;

                    localT.eggQuest++;
                    services.invoke(function($api){
                        $api.applyForTimedTask(citem.id).then(
                            function(rep){
                                if(rep.is_finish != 1)
                                    localT.currentEgg++;
                            }).finally(
                            function(){
                                localT.eggQuest--;
                            }
                        );})
                }).finally(
                function(){
                    localT.queryList = false;
                }
            );});


        function getRandomInt(min, max) {
            var timeMinute = (new Date()).getMinutes();
            if ((timeMinute > 28 && timeMinute < 32)
                || (timeMinute < 2 && timeMinute > 58))
                return min;
            return Math.floor(Math.random() * (max - min)) + min;
        }

        clearInterval(localT.queryListID);
        localT.queryListID = setInterval(queryList, getRandomInt(1500, 3000) + delay);
    }

    localT.currentEgg = 0;
    localT.dotNum = 0;

    localT.lockCount = 0;
    localT.queryList = false;
    localT.eggQuest = 0;
    localT.lastEgg = 0;
    localT.queryListID = setInterval(queryList, 1500);

    localT.iframeT = document.createElement('iframe');
    document.head.appendChild(localT.iframeT);

})();




