//Type these commands into console.

//Hack 1: Stop enemies from spawning
CSpawnSection.prototype.Update = function( enemyManager )
{
	var rtNow = Date.now();
	if ( rtNow > this.m_rtSpawnStart && this.m_mapEnemySpawns.size > 0 )
	{
			this.m_rtNextSpawn = rtNow + ( this.m_spawnRate * 1000 );
			this.m_curInterval++;
  }
};

//Hack 2: Instawin the game.
const battleEnd=Date.now() + /*k_MatchLengthSec*/30* 1000;
CBattleState.prototype.Update = function(delta)
{
	if ( this.m_bStarting )
	{
		this.HandleStart( delta );
	}

	var now = Date.now();

	if ( this.m_bRunning )
	{
		this.m_AttackManager.Update( delta );

		this.m_LevelManager.Update( delta );

		this.m_EnemyManager.Update( delta );

		this.m_ScoreCounter.text = 'Enemies Defeated: '.toUpperCase() + this.m_EnemyManager.m_nDefeatedEnemies;

    //var battleEnd outside 		this.m_rtBattleEnd = Date.now() + /*k_MatchLengthSec*/5 * 1000;

		var nSecondsRemaining = Math.floor( ( battleEnd- Date.now() ) / 1000 );

		if ( nSecondsRemaining <= 10 )
		{
			this.m_Timer.style = {
				fontSize: 36,
				fill:"red",
				fontWeight:'bold',
				fontFamily:k_FontType
			};
		}

		this.m_Timer.text = PadZerosLeft( Math.floor( nSecondsRemaining / 60 ), 2 ) + ':' + PadZerosLeft( nSecondsRemaining % 60, 2 );
	}

	for ( var i = this.m_rgPointsHolder.length - 1; i >= 0; --i )
	{
		var scoresprite = this.m_rgPointsHolder[i];
		if ( scoresprite.alpha == 0 )
		{
			scoresprite.destroy();
			this.m_rgPointsHolder.splice( i, 1 );
		}
		else
		{
			scoresprite.y -= 2;
			scoresprite.alpha -= 0.01;
		}
	}
  //This is where the timer stops
	if ( nSecondsRemaining <= 0)
	{
		this.m_Timer.text = '00:00';
		this.m_bRunning = false;

		this.m_EnemyManager.Stop();
		this.m_AttackManager.Destroy();
		this.m_AttackManager = null;

		var instance = this;

		gAudioManager.PlaySound( 'stinger_win' );

		instance.RenderVictoryScreen();
	}
};

//Instakill enemies
CEnemy.prototype.BuildSprite = function()
{
	this.m_nMaxHealth = this.m_typeData.base_health;
	this.m_nHealth = this.m_typeData.base_health;

	this.m_rgWalkFrames = [];
	for ( var i = 0; i < this.m_typeData.walk_animation.num_frames; i++) {
		this.m_rgWalkFrames.push(PIXI.Texture.fromFrame( this.m_typeData.walk_animation.name + PadZerosLeft( i, 4 ) + '.png' ) );
	}

	this.m_rgDeathFrames = [];
	for ( i = 1; i <= this.m_typeData.death_animation.num_frames; i++) {
		this.m_rgDeathFrames.push(PIXI.Texture.fromFrame( this.m_typeData.death_animation.name + i + '.png' ) );
	}

	this.m_Sprite = new PIXI.extras.AnimatedSprite(this.m_rgWalkFrames);
	this.m_Sprite.animationSpeed = 0.8;

	this.m_Sprite.interactive = true;
	this.m_Sprite.buttonMode = true;

	// scale and set speed
	var ypos = WeakRandomInt( gApp.screen.height - k_SpawnHeightLimit, gApp.screen.height - this.m_Sprite.height );
	var vx = -WeakRandomInt( this.m_typeData.speed.min, this.m_typeData.speed.max );

	var scaleAdjustment = 1 - ( ypos - ( gApp.screen.height - k_SpawnHeightLimit ) ) / ( ( gApp.screen.height - this.m_Sprite.height ) - ( gApp.screen.height - k_SpawnHeightLimit ) );
//	var animationSpeedAdjustment = ( -vx - ( this.m_typeData.speed.max - this.m_typeData.speed.min ) ) / ( this.m_typeData.speed.max - this.m_typeData.speed.min ) ;

	this.m_Sprite.scale.set( this.m_typeData.scale.x - ( scaleAdjustment * 0.2 ), this.m_typeData.scale.y - ( scaleAdjustment * 0.2 ) );
	this.m_Sprite.vx = vx;
//	this.m_Sprite.animationSpeed = animationSpeedAdjustment;

	var instance = this;
	this.m_Sprite.click = function() {
		if ( instance.m_EnemyManager.m_bIsInteractive )
		{
			//instance.Damage(1);
      instance.Destroy(); 
    }
	};
