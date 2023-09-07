 
  var Zarib = 1.2;
  var MaxBet = 0;
  
     var Bet1 = 10; 
     var Bet2 = 10;
     var Bet3 = 10;
     var Bet4 = 10; 
     var Bet5 = 10;
     var Bet6 = 10;
     var UseJob = 0;
     var BetJob = 0;
     var Use3Job = 0;
     var i = 0;
     var ii = 0;
     var iii = 0;
     var BetJob1 = 0;
     var BetJob1Zarib = 1.35;
     var BetJob2 = 0;
     var BetJob2Zarib = 1.78;
     var BetJob3 = 0;
     var BetJob3Zarib = 1.48;
     var BetJob4 = 0;
     var BetJob4Zarib = 1.68;
     var BetJob5 = 0;
     var BetJob5Zarib = 1.78;
     var MaxZarar = 0;
     var MaxLevel = 0;
     
      var GameCounter = 0;
   
    var TotalZarar = 0;
    
  game.onBet = function () {
  
  
  GameCounter = GameCounter + 1;
  if(MaxZarar <= TotalZarar){
      MaxZarar = TotalZarar;
  }
  
  if(UseJob == 0){
  i = i + 1; 
  }
  if (i >= 7 && TotalZarar <= 0){
    TotalZarar = 0;
    UseJob = 0;
    Use3Job = 0;
    i = 1;
    ii = 0;
    iii = 0;
  }
  if (i > 6 && TotalZarar > 0){
  i = 0;
  UseJob = 1;
  
  
  }
  if(UseJob == 1){
       ii = ii + 1;
       iii = iii + 1;
  }
  if (iii == 1){
        BetJob1 = TotalZarar / 0.71;
     }
     if (iii == 4){
       BetJob2 = TotalZarar / 2;
     }
     if (iii == 7){
       BetJob3 = TotalZarar / 1.3;
     }
     if (iii == 10){
       BetJob4 = TotalZarar / 1.8;
     }
     if (iii == 13){
       BetJob5 = TotalZarar / 2.2;
     }
     if(UseJob == 1 && iii >= 1 && iii < 4){
      
          BetJob = BetJob1;
          Zarib = BetJob1Zarib;
          Use3Job = 3;
     }
     if(UseJob == 1 && iii >= 4 && iii < 7){
      
          BetJob = BetJob2;
          Zarib = BetJob2Zarib;
          Use3Job = 3;
     }
     if(UseJob == 1 && iii >= 7 && iii < 10){
      
          BetJob = BetJob3;
          Zarib = BetJob3Zarib;
          Use3Job = 3;
     }
      if(UseJob == 1 && iii >= 10 && iii < 13){
      
          BetJob = BetJob4;
          Zarib = BetJob4Zarib;
          Use3Job = 3;
     }
     if(UseJob == 1 && iii >= 13 && iii < 16){
      
          BetJob = BetJob5;
          Zarib = BetJob5Zarib;
          Use3Job = 3;
     }
     if(UseJob == 1 && iii >= 16 && iii < 23){
      
          BetJob = TotalZarar / (1.9 + iii - 16);
          Zarib = iii - 13;
          Use3Job = 1;
     }
     if(UseJob == 1 && iii >= 23){
      
          BetJob = TotalZarar / 8.8;
          Zarib = 10;
          Use3Job = 1;
     }
  log.info(" TotalZarar = " + TotalZarar + "   MaxLevel = " + MaxLevel)
  if (UseJob == 1 && Use3Job >= 1){
  
  currentBet = BetJob;
  
  
  }
  if (i == 1 && UseJob == 0){
    currentBet = Bet1;
    Zarib = 1.98;
  log.error("*******************")
  }
  if (i == 2 && UseJob == 0){
    currentBet = Bet2;
    Zarib = 1.98;
  }
  if (i == 3 && UseJob == 0){
    currentBet = Bet3;
    Zarib = 1.98;
  }
  if (i == 4 && UseJob == 0){
    currentBet = Bet4;
    Zarib = 1.2;
  }
  if (i == 5 && UseJob == 0){
    currentBet = Bet5;
    Zarib = 1.2;
  }
  if (i == 6 && UseJob == 0){
    currentBet = Bet6;
    Zarib = 1.2;
    
  }
  
  if (currentBet < 1){
   currentBet = 1;
  }
     game.bet(currentBet, Zarib).then(function (payout) {
     
      if (MaxBet <= currentBet) {
       MaxBet = currentBet;
      }
      
      if (ii >= 3){
       ii = 0;
       Use3Job = 0;
      }
      
     
      if (payout > 1) {
      log.success(
        GameCounter + " Win" + " Bet = " + currentBet + " Zarib = " + Zarib + " #MaxBet = " + MaxBet + " MaxZarar = " + MaxZarar)
       
        if(UseJob == 1){
         TotalZarar = TotalZarar - ((Zarib - 1) * currentBet);
        if(TotalZarar <= 0){
         TotalZarar = 0;
         BetJob = 0;
         UseJob = 0;
         Use3Job = 0;
         ii = 0;
         iii = 0;
        } 
      
      }else{
          TotalZarar = TotalZarar - ((Zarib - 1) * currentBet);
      }
       
      
  
      }else{
          log.error(
          GameCounter +  " Lose" + " Bet = " + currentBet + " Zarib = " + Zarib + " #Max = " + MaxBet + " MaxZarar = " + MaxZarar)
          TotalZarar = TotalZarar + currentBet;
      
      
    
    
    
    }
      
     
        log.info("Level = " + iii)
        if(MaxLevel <= iii){
          MaxLevel = iii;
        }
     });
   };
  }