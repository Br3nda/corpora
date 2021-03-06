class Listen{
  constructor(person_pk, target_element_selector, content_type, admin=false, user_id=null){
    var self = this;
    this.debug = false
    this.sentence_block = $(target_element_selector)
    this.admin = admin
    this.user_id = user_id
    this.objects = null
    this.recording = null
    this.sentence = null
    if(admin){
      this.base_url = '/api/recordings/'
      this.base_recording_url = '/api/recordings/'
      this.url_filter_query = '?sort_by=listen'
    } else{
      this.base_url = '/api/listen/'
      this.base_recording_url = '/api/listen/'
      this.url_filter_query = '?sort_by=random'
    }
    
    this.base_quality_url = '/api/qualitycontrol/'
    this.next_url = null
    this.quality_control = {}
    this.quality_control.person = person_pk
    this.error_loop = 0
    this.audio = document.getElementById('play-audio');
    this.quality_control.content_type = content_type
    $(this.sentence_block).fadeOut(0)

    
    $(self.sentence_block).find('.approve').off().on('click', function(e){
      if (!$(e.currentTarget).hasClass('disabled')){
        $(self.sentence_block).find('.actions a').addClass('disabled')
        self.approve();
      }
    })

    $(self.sentence_block).find('.good').off().on('click', function(e){
      if (!$(e.currentTarget).hasClass('disabled')){
        $(self.sentence_block).find('.actions a').addClass('disabled')
        self.up_vote();
      }
    })   

    $(self.sentence_block).find('.bad').off().on('click', function(e){
      if (!$(e.currentTarget).hasClass('disabled')){
        $(self.sentence_block).find('.actions a').addClass('disabled')
        self.down_vote();
      }
    })

    $(self.sentence_block).find('.next').off().on('click', function(e){
      if (!$(e.currentTarget).hasClass('disabled')){
        $(self.sentence_block).find('.actions a').addClass('disabled')
        self.audio.pause()
        // self.audio.src=null
        self.next();
      }
    })  


    // CREATE AND REGISTER EVENT LISTENERS
    var event = document.createEvent('Event');
    event.initEvent('listen.recording.loaded', true, true);
    this.recording_loaded_event = event;

  }

  show_loading(){
    $('.circle-button-container a').hide();
    $('.circle-button-container a.loading').show()   
  }

  hide_loading(){
    $('.circle-button-container a').hide();
  }

  get_recordings(){
    var self = this;
    self.logger('Fetching more recordings')
    self.show_loading()
    $.ajax({
        url: ((this.next_url==null) ? this.base_url : this.next_url)+this.url_filter_query,
        error: function(XMLHttpRequest, textStatus, errorThrown){
          self.logger('ERROR fetching recordings')
          
        }
        }).done(function(d){
          self.objects = d.results
          self.next_url = d.next

          if (self.objects.length == 0 || self.error_loop>3){
            self.logger('No more recordings')
            self.all_done()
          }
          else{
            self.logger('Got recordings')
            self.logger(self.objects[0])
            self.next()
          }
        }).fail(function(){
          self.logger('Failed to fetch recordings, will try again...')
          window.setTimeout( function(){
            self.next_url=null
            self.get_recordings()
            self.hide_loading()
          }, 500 )

        });
  }

  reload(){
    var self = this
    $.ajax({
        url: this.base_recording_url+this.recording.id+'/'
        }).done(function(d){
          self.logger('Reloaded')
          self.logger(d)
          self.recording.quality_control = d.quality_control
          self.recording = d
          self.sentence = d.sentence
          self.show_next_recording()
    })    
  }

  next(){
    this.logger('Next')
    if (this.objects == null || this.objects.length==0){
      this.get_recordings()
    } else{
      this.recording = this.objects.shift()
      this.sentence = this.recording.sentence

      if (this.recording.sentence_text == '' || this.recording.sentence_text==null){
        if (this.sentence==null){
          this.recording.sentence_text = 'These arent teh droid your looking for'
          this.logger('error')
          this.error_loop+=1
          // this.show_next_recording()
          this.next()
        } else { this.recording.sentence_text = this.sentence.text }
        
      }

      if (this.sentence==null && this.recording.sentence_text.length>0){
        this.sentence = {}
        this.sentence.text=this.recording.sentence_text
      }

      this.show_next_recording()
    }
  }

  all_done(){
    $(this.sentence_block).text("All done.")
    $(this.sentence_block).fadeIn('disabled')
  }

  show_next_recording(){
    var self = this;

    this.logger('Show next recording')
    self.show_loading();

    if (this.sentence){
      $(self.sentence_block).removeClass('disabled')
      $(self.sentence_block).find('.sentence .text-area').remove()


      var display_text = this.recording.sentence_text

      if (this.admin){
        var input_elm = $('<textarea id="editText" class="text-area" type="textarea" name="text" rows="4">')
        $(input_elm).val(display_text);
        $(this.sentence_block).find('.sentence').append(input_elm)
        $(this.sentence_block).fadeIn('fast');        
        $(this.sentence_block).find('.sentence').textfill({
          maxFontPixels: 40,
          innerTag: 'textarea',
          success: function(){
            var space = 
              parseFloat($(this.sentence_block).find('.sentence').parent().css('line-height')) /
              parseFloat($(this.sentence_block).find('.sentence').parent().css('font-size'))
              $(this.sentence_block).find('.sentence').css('line-height', space+'px')
          }
        })

      } else {

        var input_elm = $('<span class="text-area"></span>')
        $(input_elm).text(display_text);
        $(this.sentence_block).find('.sentence').append(input_elm)
        $(this.sentence_block).fadeIn('fast');        
        $(this.sentence_block).find('.sentence').textfill({
          maxFontPixels: 40,
          success: function(){
            var space = 
              parseFloat($(this.sentence_block).find('.sentence').parent().css('line-height')) /
              parseFloat($(this.sentence_block).find('.sentence').parent().css('font-size'))
              $(this.sentence_block).find('.sentence').css('line-height', space+'px')
          }
        })

      }
      

      // $('#play-button').show();

      $.ajax({
        type: "GET",
        url: this.base_recording_url+this.recording.id+'/',
        dataType: 'json',
        error: function(XMLHttpRequest, textStatus, errorThrown){
          self.logger(textStatus.responseText)
          self.logger(XMLHttpRequest)
          self.logger(errorThrown)
        }
      }).done(function(){

        $(self.sentence_block).find('.next, .auto-play').removeClass('disabled')
        self.hide_loading()
        self.audio.src = self.recording.audio_file_url
        self.audio.load()
        document.dispatchEvent(self.recording_loaded_event);

      }).fail(function(){
        console.error('FAILED TO GET RECORDING FILE')
        window.setTimeout(function(){
          self.next()
        }, 1000)
      })


      $(input_elm).on('change', function(){
        self.edit_sentence()
      })

      $(input_elm).on('keyup', function(event){
        self.check_sentence_changed(event)
      })


      $(self.audio).bind('error', function(){
        self.next()
      })
    }
  }

  check_sentence_changed(event){
    if ($(event.currentTarget).val() != this.sentence.text){
      this.edit_sentence()
    }
  }

  edit_sentence(){
    var self = this
    $(self.sentence_block).find('.approve, .good, .bad').addClass('disabled')
    $(self.sentence_block).find('.save').removeClass('off').removeClass('disabled')
    $(self.sentence_block).find('.save').off().on('click', function(e){
        $(e.currentTarget).addClass('disabled').off()
        self.save_sentence($(self.sentence_block).find('.text-area').val());
    })     
  }

  post_qc(data){
    var self = this
    self.show_loading()
    this.quality_control.object_id = this.recording.id
    $.ajax({
      type: "POST",
      data: this.quality_control,
      url: this.base_quality_url,
      dataType: 'json',
      error: function(XMLHttpRequest, textStatus, errorThrown){
        self.logger(XMLHttpRequest.status)
        self.logger(XMLHttpRequest.responseText)
        self.hide_loading()
      }
    }).done(function(){
      self.next();
    }).fail(function(){
      self.logger('Failed.')
      self.hide_loading()
    })
    return true;    
  }

  put_qc(data){
    var self = this
    self.show_loading()
    $.ajax({
      type: "PUT",
      data: data,
      url: this.base_quality_url+this.quality_control_id+'/',
      dataType: 'json',
      error: function(e){
        self.logger(e.responseText)
        self.hide_loading()
      }
    }).done(function(){
      self.next();

    }).fail(function(){
      self.logger('Failed.')
      self.hide_loading()
    })
    return true;    
  }

  save_sentence(text){
    var self=this
    this.recording.sentence_text = text
    self.show_loading()
    var data = {
      id: this.recording.id,
      sentence_text: text
    }

    $.ajax({
      type: "PUT",
      data: data,
      url: this.base_recording_url+this.recording.id+'/',
      dataType: 'json',
      error: function(XMLHttpRequest, textStatus, errorThrown){
        self.logger(textStatus.responseText)
        self.logger(XMLHttpRequest)
        self.logger(errorThrown)
        self.hide_loading()
      }
    }).done(function(){
      self.logger('Saved')
      self.reload();
      self.hide_loading()
    }).fail(function(){
      self.logger('Failed.')
      self.hide_loading()
    })
  }

  post_put(){
    var self = this
    var method = 'POST'
    this.quality_control.object_id = this.recording.id
    this.audio.pause()
    if (this.recording.quality_control){
      for (let qc of this.recording.quality_control){
        if (qc.person == this.quality_control.person){
          self.logger('Found matching qc ')
          this.quality_control_id = qc.id
          this.quality_control.bad += qc.bad
          this.quality_control.good += qc.good
          method = 'PUT'
        } else{
          
        }
      }
    }

    if (method=='POST'){
      this.post_qc(this.quality_control)
    } else {
      this.put_qc(this.quality_control)
    }

  }

  approve(){
    this.quality_control.approved = true;
    this.quality_control.good = 0
    this.quality_control.bad = 0    
    this.quality_control.approved_by = this.user_id;
    this.logger(this.quality_control);
    this.post_put();
  }
  up_vote(){
    this.quality_control.good = 1
    this.quality_control.bad = 0
    this.quality_control.approved = false;
    this.logger(this.quality_control);
    this.post_put();
  }

  down_vote(){
    this.quality_control.bad = 1
    this.quality_control.good = 0
    this.quality_control.approved = false;
    this.logger(this.quality_control);
    this.post_put();
  }

  logger(s){
    if (this.debug){
      console.log(s)
    }
  }

}