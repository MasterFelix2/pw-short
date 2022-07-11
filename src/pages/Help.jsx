import React from 'react'

const Help = () => {
  return (
    <div className='placeholder-page'>
      <div>

        
        <p>The cost to attack and caputre a territory is the defender power divided by the attacker power) x 4 + 1 base cost</p>

        <h2>Basic Actions</h2>

          <h2>Attack</h2>

          <h4>Battle mechanics</h4>
          <p>In this game there are no damaged divisions. Instead of divisions taking damage and dealing damage in every fight, they have a probability to shatter and be removed from the game.</p>
          <p>The likelyhood of a division being shattered is based on the strength of the divisions amassed in the territories that are involved in the battle. </p>
          <p>Combat starts by checking whether tank divisions are involved and whether they have been shattered.</p>
          <p>If no tank divisions are involved or no tank division has been shattered, the strength number is applied to the infantry.</p>
          <p>For every 20 strength of the enemy one of your infantry divisions will be shattered for sure.</p>
          <p>For every strength above that, the probability goes up for an extra division to be shattered.</p>
          <h4>Example</h4>
          <p>Attack strength: 24, Defence strength: 7</p>
          <p>The defender loses 1 division and has a 4*5 = 20% probability of shattering an additional division</p>
          <p>the attacker has a 7*5 = 35% probability of having a division shattered.</p>

          <h4>Combat strength calculation</h4>
          <p>Attacking power: Number of attacking tanks x 5 x tank research level + Number of attacking infantry divisions x 1 x infantry research level</p>
          <p>Defending power: Same unit strength calculation as attacker, but 2 base defence points for every level of fortification, +20% strength as defender bonus, and +40% strength for every level of fortification.</p>

          <h4>A territory can only be attacked once every 5 hours.</h4>

          <h4>Move</h4>

          <p>Moving divisions</p>

          <h4>Assault</h4>
          <h4>Fortify</h4>
          <p>Increases the fortification level of a territory. </p>
          <h4>Artillery Barrage</h4>
          <p>Has a chance to shatter enemy divisions in a territory.</p>

          <h4>Counter attack</h4>
        
        <h2>Additional Actions (different for Russia and Germany)</h2>
          <h4>Germany:</h4>
          <h4>Reinforce the norther front</h4>
          <h4>Reinforce the central front</h4>
          <h4>Reinforce the southern front</h4>
          <h4>Reinforce the southern coastal front</h4>
          <h4>Reinforce the finnish front</h4>

        <h2>Encirclements</h2>
        <p>Encirclments are important as all remaining divisions are automatically shattered if they have no friendly neighboring territory to retreat into. However, encircled units do not suffer combat penalties if they are still connected to more than 2 friendly territories.</p>
        
        <h2>Uprades</h2>
        <h4>Propaganda Level: Increases the points you generate by being productive.</h4>
        <h4>Economy Level: Increases the points you generate ever hour based on the number or territories and cities you own.</h4>
        <h4>Infrastructure Level: Allows you to move an increasing number of divisions for no cost an increasing distance every day.</h4>        

        <h3>Combat upgrades:</h3>
        <h4>Tank Production Level: Reduces the amount of time it takes to automatically spawn new tank divisions by 5%.</h4>
        <h4>Tank Research Level: Increases fighting strength of tank divisions by 20%.</h4>
        <h4>Recruitment Level and Infantry Research Level are the same as the tank upgrades.</h4>
        <h4>Army Training Level: </h4>
        <p>Lvl 1: -1 cost to attack, lvl 2: -1 cost to assault, lvl 3: -10% shatter probability, lvl4: +1 cost for enemy to attack, lvl5: -1 cost to attack, lvl 6: -1 cost to assault, lvl 7: -10% shatter probability, lvl 8: +1 cost for enemy to attack, lvl9: -1 cost to attack, lvl 10: -1 cost to attack</p>
        <h4>Army Research Level: </h4>
        <p>Lvl 2: -1 cost to upgrade, lvl 3: -5 cost on all actions, lvl4: +20% strength of fortifications lvl5: -1 cost to fortify, lvl 6: -1 cost of artillery barrage lvl 7: -1 cost to upgrade, lvl 8: +20% strength of fortifications, lvl9: -1 cost of artillery barrage, lvl 10: unlock the katyusha ability)</p>

        <h2>Victory conditions</h2>
        <h4>Germany: Hold Leningrad, Moscow, Kharkov for 10 days before day 180.</h4>
        <h4>Or hold Maikop, Grozny, Stalingrad and one of (Leningrad, Moscow and Baku) before day 500.</h4>
        <h4>Russia: Hold out until Germany loses at day 501.</h4>

        <h2>Important to know</h2>
        <h4>Murmansk is worth a lot of points and as it is the supply line for Russia by the allies.</h4>
        <h4>Cutting the land connection between Murmansk and the rest of Russia has no effect. Only Murmansk itself matters in this game.</h4>

        

        <h4>Every basic territory gives 0.5 economy points. Tier 1 cities give 5 points, tier 2 cities 10 points, tier 3 cities 15 points.</h4>
        <h4>Leningrad:50 , Moscow:80 and Stalingrad:40.</h4>
        <h4>Oil fields: Maikop: 30, Grozny: 40, Baku: 80</h4>

      </div>
      
    </div>
  )
}

export default Help