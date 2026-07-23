import React from 'react'

const playersData = [
    {
        name: "M. Marlowe"
    },
    {
        name: "R. Spade"
    },
    {
        name: "V. Archer"
    }
]

const LobbyCard = () => {
  return (

    <div className='text-paper'>
        {/* card div */}
        <div>

            {/* Room Code */}
            <div>
                <div>
                    <span>ROOM CODE</span>
                    <span>4KX9</span>
                </div>

                <button>COPY</button>
            </div>

            {/* Players */}
            <div>
                <span>DETECTIVES ON THE CASE (3/8)</span>

                <ul>
                    {
                        playersData.map((player, index) => (
                            <li key={index}>{player.name}</li>
                        ))
                    }
                </ul>
            </div>

            {/* Case Parameters -> Settings */}
            <div>
                <span>CASE PARAMETERS</span>

                <div>
                    <span>ROUNDS</span>

                    <div>
                        <span>-</span>
                        <span>6</span>
                        <span>+</span>
                    </div>
                </div>

                <div>
                    <span>SECONDS TO GUESS</span>

                    <div>
                        <button>-</button>
                        <button>30</button>
                        <button>+</button>
                    </div>
                </div>

            </div>
            {/* Case parameters end */}
            
            <button>OPEN THE CASE</button>

        </div>
        {/* Room Card End */}
    </div>
  )
}

export default LobbyCard