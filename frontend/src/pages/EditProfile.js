import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import DeregisterAccount from "../components/DeregisterAccount";
import ChangePassword from "../components/ChangePassword";
import { getUsername } from "../api/users";
import { Avatar, Box, Skeleton, Typography } from "@mui/material";
import { FaUserGroup } from 'react-icons/fa6';
import { fetchAllAnsweredQuestionsByUsername } from "../api/history";
import HistoryTable from "../components/HistoryTable";
import ProgressBar from "../components/ProgressBar";
import 'react-toastify/dist/ReactToastify.css';
import { toast } from 'react-toastify';

const EditProfile = () => {
  const [history, setHistory] = useState(undefined);
  const [username, setUsername] = useState("");

  const [isChangeVisible, setIsChangeVisible] = useState(false);
  const [isChangeSuccess, setIsChangeSuccess] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const res = await getUsername();
      setUsername(res);

      const hist = await fetchAllAnsweredQuestionsByUsername(res);
      setHistory(hist);
    }

    fetchData();
  }, []);

  useEffect(() => {
    if (isChangeSuccess) {
      setIsChangeVisible(false);
      changeSuccessNotify();
      setIsChangeSuccess(false);
    }
  }, [isChangeSuccess])

  const changeSuccessNotify = () => toast.success('Password changed!', {
    position: "top-center",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "dark",
});

  return (
    <div>
      <Navbar />
      <Box sx={{ width: '95%', minHeight: '90vh', display: 'flex', margin: 'auto', flexWrap: 'wrap'}}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            minWidth: '25%',
            bgcolor: '#232323',
            ml: 3,
            my: 3,
            textAlign: 'center',
            borderRadius: 2,
            flexGrow: 1,
          }}
        >
          <Avatar
            alt={username}
            src="broken.jpg"
            sx={{
              width: 50,
              height: 50,
              bgcolor: '#787575',
              mx: 'auto',
              mt: 5,
              mb: 1
            }}
          />
          <Typography sx={{ fontSize: 24, fontWeight: 'bold', color: '#FFFFFF'}}>
            {username}
          </Typography>
          <Box
            sx={{
              display: 'inline-flex',
              textAlign: 'left',
              alignItems: 'center',
              mx: 'auto',
              mt: 3
            }}
          >
            <FaUserGroup style={{ color: '#FFFFFF', fontSize: 36, marginRight: 10}} />
              Role: 
            <Typography 
              sx={{ 
                fontSize: 22,
                fontWeight: 'bold',
                ml: 1,
                textDecoration: 'underline' 
              }}>
              {localStorage.getItem("credentials")["isManager"] ? "MANAGER" : "USER"}
            </Typography>
          </Box>
          <ChangePassword isChangeVisible={isChangeVisible} setIsChangeVisible={setIsChangeVisible} setIsChangeSuccess={setIsChangeSuccess} />
          <DeregisterAccount />
        </Box>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            mx: 3,
            mt: 3,
            alignItems: 'stretch',
            flexGrow: 1
          }}
        >
          <Box
            sx={{
              height: '60%',
              bgcolor: '#232323',
              mb: 1,
              borderRadius: 2,
            }}
          >
            <Typography
              sx={{
                mb: 1,
                mt: 2,
                ml: 2,
                fontWeight: 'bold',
                fontSize: 20,
                color: '#FFFFFF'
              }}
            >
            Answered Questions
          </Typography>
            { history ?
              <HistoryTable history={history} />
              : <Skeleton variant="rectangular" width='100%' height="40vh" color='#FFFFFF' sx={{ bgcolor: 'grey' }} />
            }
          </Box>
          <Box
            sx={{
              height: '40%',
              bgcolor: '#232323',
              mb: 3,
              borderRadius: 2
            }}
          >
          <Typography variant="h6" m={2} gutterBottom>
            Solved Questions
          </Typography>
            { history
                ? <ProgressBar userHistory={history} minHeight='50%' />
                : <Skeleton variant="rectangular" width='100%' height="50%" color='#FFFFFF' sx={{ bgcolor: 'grey' }} />
            }
          </Box>
        </Box>
      </Box>
    </div>
  );

};

export default EditProfile;