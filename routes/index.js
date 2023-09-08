const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const fs = require('firebase-admin');

const { sendResponse, sendError } = require('../helpers/utils');
const { loginSchema } = require('../schemas/user.schema');
const { sign, getUserId } = require('../services/jwt');

const db = fs.firestore();

router.post('/users', async (req, res) => {
    try {
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(req.body.Password, salt);

        let userRef = db.collection('users').doc();
        userRef.set({ 
            UserID: userRef.id, 
            UserName: req.body.UserName,
            Password: passwordHash,
            UserRoleID: req.body.UserRoleID,
            UserOrganizationID: req.body.UserOrganizationID,
            Name: req.body.Name,
            EmailID: req.body.EmailID,
            PhoneNumber: req.body.PhoneNumber,
            Status: 'Active',
            CreatedAt: new Date(),
            UpdatedAt: new Date()
        })
        
        return sendResponse(res, { "message": "User created successfully"});
    } catch(error) {
      res.send(error);
    }
});

router.post('/login', async (req, res) => {
    try {
        const { error } = loginSchema.validate(req.body);
        if (error) {
        return sendError(res, error.message);
        }
        const userRef = await db.collection('users')
                .where("UserName", "==", req.body.UserName)
                .get()
                .then((value) => {
                const data = value.docs.map((doc) => doc.data());
                return data;
            });

        if (userRef.length === 0) {
            return sendError(
            res,
            'User Account does not exists Please check your credentials and try again'
            );
        }
        const validPassword = await bcrypt.compare(req.body.Password, userRef[0].Password);
        if (!validPassword) {
            return sendError(res, 'Incorrect password. Please check your password and try again');
        }

        const resp = {
            token: sign({ UserID: userRef[0].UserID,  EmailID: userRef[0].EmailID, UserRoleID: userRef[0].UserRoleID})
        };
        return sendResponse(res, resp);
    } catch(error) {
      res.send(error);
    }
});

router.post('/roles', async (req, res) => {
    try {
        const user = getUserId(req.headers.authorization);

        if (user.UserRoleID=='1') { 

        let roleRef = db.collection('roles').doc();
        roleRef.set({ 
            RoleID: roleRef.id, 
            RoleName: req.body.RoleName,
            PrivilegesID: req.body.PrivilegesID,
            Status: 'Active'
        })
        
        return sendResponse(res, { "message": "Role created successfully"});
        } else {
        sendError(res, 'User is not able to create Role');
      }
    } catch(error) {
      res.send(error);
    }
});

router.get('/roles', async (req, res, next) => {
    try {
      const user = getUserId(req.headers.authorization);
      if (user.UserRoleID=='1') {
        
        const roleRef = await db.collection('roles')
                .get()
                .then((value) => {
                const data = value.docs.map((doc) => doc.data());
                return data;
        });

        if (roleRef.length === 0) {
          return sendError(res, 'No Roles found', 404);
        } else {
          return sendResponse(res, roleRef);
        }
      } else {
        sendError(res, 'User not found');
      }
    } catch (error) {
      sendError(res, error.message);
    }
  });

module.exports = router;