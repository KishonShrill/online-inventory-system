import { Link } from "react-router-dom"

const Homepage = () => {
    return (
        <Link style={{display: "grid", placeContent: "center"}} to={'/dashboard'} >
            <h1 style={{color: "white"}}>Dashboard</h1>
        </Link>
    )
}

export default Homepage