var beer_svg='<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="512px" height="512px" viewBox="0 0 512 512" enable-background="new 0 0 512 512" xml:space="preserve"><path id="beer-5-icon" d="M351.809,414.349V195.097c18.994-10.198,31.943-30.25,31.943-53.277c0-32.168-25.268-58.548-56.996-60.336 C313.539,63.063,291.392,50,265.409,50c-16.671,0-33.396,5.523-47.151,16.548c-24.044-7.834-51.414-1.577-69.546,17.89 c-24.427,0.469-45.717,9.044-57.79,30.047c-8.764,15.244-10.05,32.479-10.674,50.272c-1.056,30.092-21.869,31.153-25.674,66.733 c-3.541,33.114,19.759,57.062,48.038,57.062c5.15,0,10.155-0.823,14.87-2.368v128.165c0,11.399-9.242,20.642-20.645,20.642V462 h275.615v-27.01C361.053,434.99,351.809,425.748,351.809,414.349z M102.612,261.497c-11.408,0-23.052-9.214-21.136-27.131 c2.838-26.555,24.403-28.529,25.811-68.661c1.079-30.751,3.766-58.596,54.818-53.664c6.581-12.89,19.979-21.724,35.445-21.724 c10.153,0,19.413,3.81,26.445,10.071c8.486-13.988,23.857-23.333,41.413-23.333c21.55,0,39.804,14.087,46.075,33.554 c3.679-1.396,7.668-2.167,11.837-2.167c18.434,0,33.375,14.942,33.375,33.376c0,18.433-14.941,33.376-33.375,33.376 c-10.755,0-20.313-5.09-26.418-12.987c-20.579,17.656-51.819,15.028-69.101-6.277c-13.646,15.969-37.697,19.688-57.158,3.475 c-6.518-5.429-12.765-7.823-18.526-7.823c-23.844,0-39.304,41.05-30.56,77.772C126.71,250.99,114.795,261.497,102.612,261.497z M148.597,250.9c1.816-8.566,1.621-17.991-0.718-27.812c-2.356-9.895-2.3-21.145,0.152-30.865c1.54-6.099,3.605-10,5.118-12.174 c0.059,0.047,0.117,0.096,0.178,0.146c13.15,10.957,28.555,16.749,44.547,16.749c10.101,0,19.941-2.324,28.85-6.661 c11.542,6.903,24.847,10.645,38.695,10.645c10.093,0,20.014-2.032,29.188-5.886c8.251,4.459,17.522,6.953,27.204,7.188V250.9 H148.597z M372.453,388.951v-37.086c54.162-31.412,66.584-107.752,25.104-107.752h-25.104v-33.958h31.279 C489.269,210.155,469.161,352.398,372.453,388.951z"/></svg>';


var recommendation = {
    rewarded: false,
    init: function(){
        this.beers();
        $('#reward-btn').hide();
        $('.step-2').hide();
        $('.step-3').hide();
        $('#result').hide();

        $("#rec").submit(function(e) {
            $('#reward-btn').prop('disabled',false);
            $('#reward-btn').text('Submit beer choice');
            $('#reward-btn').hide();
            recommendation.rewarded = false;
            e.preventDefault();
            recommendation.submit();
            global.resize();
        });

        beers.forEach(function(beer){
            $("#beers").append('<option value="'+beer+'">'+beer+'</option>');
        });

        $(".chosen-select").chosen({no_results_text: "Oops, nothing found!"});
        $('.beer:not(.active)').on('click', function(){
            if (!recommendation.rewarded){
                $(".beer.active").removeClass('active');
                $(this).addClass('active');
                var item_rank = $(this).attr('data-id');
                $('#current-selection').val(item_rank);
                $('#reward-btn').show();
                $('.step-3').show();
                global.resize();
            }
        });

        $('#reward-btn').on('click', function(e){
            e.preventDefault();
            recommendation.rewarded = true;
            $("#reward-btn").text("Thanks!");
            $("#reward-btn").prop('disabled',true);
            var item_num = $('#current-selection').val(),
            id = $('#u-id').val();
            $('#u-id').val('');
            $('#current-selection').val('10');
            try{
                int_num = parseInt(item_num,10);
                if (int_num > 9){
                    throw new Exception();
                } else if (int_num < 0) {
                    throw new Exception();
                }
                var payload = {
                    id: id,
                    item: item_num
                };

                $.ajax({
                    type: "POST",
                    url: "/update",
                    async: false,
                    // timeout: 3000,
                    data: JSON.stringify(payload),
                    contentType: "application/json",
                    success: function(d) {
                        var arm = d.arm,
                            armName = d.arm_name,
                            reward = d.reward;
                        if (isNaN(arm)){
                            arm = parseInt(arm,10);
                        }
                        arm = arm + 1;
                        var text = ["<h3>Result:</h3>",
                                    "<hr>","The recommender used was <code>" + armName.toString() + "</code>","<br>",
                                    "The recommender is arm <code>" + arm + "</code> of the bandit","<br>",
                                    "Your selection produced a reward of <code>" + reward.toString() + "</code>"
                                    ].join('');
                        $('#result').html(text);
                        $('#result').show();
                        global.resize();
                    }

                });
            } catch (err){
                var text = ["<h3>Result:</h3>",
                            "<hr>Sorry an error occurred please retry your search"];
                $('#result').html(text);
                $('#result').show();
                global.resize();
            }
        });
    },
    beers: function(){
        for (var i=0; i < 5; i++){
            $('.col-1').append('<li class="beer" data-id="'+i+'">'+beer_svg+'<span class="name"></span></li>');
        }
        for (var i=5; i < 10; i++){
            $('.col-2').append('<li class="beer" data-id="'+i+'">'+beer_svg+'<span class="name"></span></li>');
        }
    },
    submit: function(){

        var chosen_beer = $("#beers").val();
        var payload = {
            beers: chosen_beer,
        };

        $.ajax({
            type: "POST",
            url: "/",
            data: JSON.stringify(payload),
            contentType: "application/json",
            success: function(d) {
                recommendation.reset();
                if (d.result.length){
                    $('.results p').addClass('show');
                }
                for (var i=0; i < 5; i++){
                    var $this_beer = $('.col-1 .beer:nth-child('+(i+1)+')');
                    $this_beer.find('.name').html(d.result[i].beer);
                    $this_beer.addClass('show');
                }
                for (var i=5; i < 10; i++){
                    var $this_beer = $('.col-2 .beer:nth-child('+(i-4)+')');
                    $this_beer.find('.name').html(d.result[i].beer);
                    $this_beer.addClass('show');
                }
                $('#u-id').val(d.uid);
                $('.step-2').show();
                $('#result').hide().children('code').text('');
                $(".beer").removeClass('active');
                setTimeout(function(){
                    global.resize();
                }, 300);
            }
        });
        global.resize();
        return false;
    },
    reset: function(){
        $('.results p').removeClass('show');
        $('.beer').removeClass('show');
         $(".beer").removeClass('active');
        $('#result').hide().children('code').text('');
        global.resize();
    }
};

var global = {
    init: function(){
        global.resize();


        $(window).on('resize', function(){
            global.resize();
        });
    },
    resize: function(){
        $('.jumbotron').css('min-height', $('body').height());
    }
};

$(document).ready(function(){
    recommendation.init();
    global.init();
});
