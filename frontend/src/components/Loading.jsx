import React from 'react'
import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

const Loading = () => {

  const {nextUrl} = useParams()
  const navigate = useNavigate()

  useEffect(()=>{
    if(nextUrl){
      setTimeout(()=>{
        navigate('/' + nextUrl)
      }, [])
    }
  }, [])

  return (
    <div className='flex justify-center items-center h-[80vh]'>
      <div className='animate-spin rounded-full h-14 w-14 border-2 border-t-red-400'>

      </div>
    </div>
  )
}

export default Loading
