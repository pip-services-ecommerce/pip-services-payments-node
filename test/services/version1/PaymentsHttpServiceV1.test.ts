// let async = require('async');
// let assert = require('chai').assert;
// let restify = require('restify');

// import { ConfigParams } from 'pip-services3-commons-node';
// import { Descriptor } from 'pip-services3-commons-node';
// import { References } from 'pip-services3-commons-node';
// import { FilterParams } from 'pip-services3-commons-node';
// import { PagingParams } from 'pip-services3-commons-node';

// import { PracticeContentSetV1, VersionedPracticeContentV1 } from '../../../src/data/version1';
// import { PracticeContentSetMemoryPersistence, PracticeContentMemoryPersistence } from '../../../src/persistence';
// import { PracticeContentController } from '../../../src/logic/PaymentsController';
// import { PracticeContentHttpServiceV1 } from '../../../src/services/version1/PaymentsHttpServiceV1';

// var now = new Date();

// const PRACTICE1: PracticeContentSetV1 = {
//     id: '1',
//     author_id: '1',
//     create_time: now,
//     deleted: false,
//     update_time: null,
//     user_count: 0,
//     versions: []
// };
// const PRACTICE2: PracticeContentSetV1 = {
//     id: '2',
//     author_id: '2',
//     create_time: now,
//     deleted: false,
//     update_time: null,
//     user_count: 0,
//     versions: []
// };

// const VERPRACTICE1: VersionedPracticeContentV1 = {
//     id: '111',
//     version_id: '1',
//     author_id: '1',
//     title: 'Test Practice 1',
//     category: 'Test',
//     create_time: now,
//     content_version: '1',
//     content: '{"id":"01","version":"1.0","title":"test","category":"test","keywords":["a","b"],"description":"test description","images":["https://google.com/1.png","https://google.com/2.png"],"author":{"id":"jd","name":"John Doe","about":null,"url":null},"thumbnail":"https://google.com/1.png","duration":10,"created":"2020-05-31T21:00:00.000Z","published":null,"modified":null,"back_audio":null,"segments":[],"parameters":[],"levels":[]}',
//     user_count: 0
// };

// const VERPRACTICE2: VersionedPracticeContentV1 = {
//     id: '222',
//     version_id: '2',
//     author_id: '2',
//     title: 'Test Practice 2',
//     category: 'Test',
//     create_time: now,
//     content_version: '1',
//     content: '{"id":"02","version":"1.0","title":"test","category":"test","keywords":["a","b"],"description":"test description","images":["https://google.com/1.png","https://google.com/2.png"],"author":{"id":"jd","name":"John Doe","about":null,"url":null},"thumbnail":"https://google.com/1.png","duration":10,"created":"2020-05-31T21:00:00.000Z","published":null,"modified":null,"back_audio":null,"segments":[],"parameters":[],"levels":[]}',
//     user_count: 0
// };

// var httpConfig = ConfigParams.fromTuples(
//     "connection.protocol", "http",
//     "connection.host", "localhost",
//     "connection.port", 3000
// );

// suite('PracticeContentHttpServiceV1', () => {
//     let practiceContentPersistence: PracticeContentMemoryPersistence;
//     let practiceContentSetPersistence: PracticeContentSetMemoryPersistence;
//     let controller: PracticeContentController;
//     let service: PracticeContentHttpServiceV1;
//     let rest: any;

//     setup((done) => {
//         let url = "http://localhost:3000";
//         rest = restify.createJsonClient({ url: url, version: '*' });

//         practiceContentSetPersistence = new PracticeContentSetMemoryPersistence();
//         practiceContentSetPersistence.configure(new ConfigParams());

//         practiceContentPersistence = new PracticeContentMemoryPersistence();
//         practiceContentPersistence.configure(new ConfigParams());

//         controller = new PracticeContentController();
//         controller.configure(new ConfigParams());

//         service = new PracticeContentHttpServiceV1();
//         service.configure(httpConfig);

//         let references = References.fromTuples(
//             new Descriptor('guru-practicecontentset', 'persistence', 'memory', 'default', '1.0'), practiceContentSetPersistence,
//             new Descriptor('guru-practicecontent', 'persistence', 'memory', 'default', '1.0'), practiceContentPersistence,
//             new Descriptor('guru-practicecontent', 'controller', 'default', 'default', '1.0'), controller,
//             new Descriptor('guru-practicecontent', 'service', 'http', 'default', '1.0'), service
//         );

//         practiceContentPersistence.setReferences(references);
//         controller.setReferences(references);
//         service.setReferences(references);

//         practiceContentSetPersistence.open(null, (err) => {
//             if (err) {
//                 if (err) throw err;
//             }
//             practiceContentPersistence.open(null, null);
//             service.open(null, done);
//         });
//     });

//     teardown((done) => {
//         service.close(null, (err) => {
//             practiceContentPersistence.close(null, null);
//             practiceContentSetPersistence.close(null, done);
//         });
//     });

//     test('CRUD Operations', (done) => {
//         let practice1: PracticeContentSetV1;
//         let ver_practice1: VersionedPracticeContentV1;

//         async.series([
//             // Create the first practice
//             (callback) => {
//                 rest.post('/v1/practice_content/add_practice',
//                     {
//                         practice: PRACTICE1
//                     },
//                     (err, req, res, practice) => {
//                         assert.isNull(err);

//                         assert.isObject(practice);
//                         assert.equal(PRACTICE1.id, practice.id);
//                         assert.equal(PRACTICE1.author_id, practice.author_id);
//                         //assert.equal(PRACTICE1.create_time.getTime(), practice.create_time.getTime());
//                         assert.equal(PRACTICE1.deleted, practice.deleted);
//                         assert.equal(PRACTICE1.versions.length, practice.versions.length);

//                         callback();
//                     }
//                 );
//             },
//             // Create the second practice
//             (callback) => {
//                 rest.post('/v1/practice_content/add_practice',
//                     {
//                         practice: PRACTICE2
//                     },
//                     (err, req, res, practice) => {
//                         assert.isNull(err);

//                         assert.isObject(practice);
//                         assert.equal(PRACTICE2.id, practice.id);
//                         assert.equal(PRACTICE2.author_id, practice.author_id);
//                         //assert.equal(PRACTICE2.create_time.getTime(), practice.create_time.getTime());
//                         assert.equal(PRACTICE2.deleted, practice.deleted);
//                         assert.equal(PRACTICE2.versions.length, practice.versions.length);

//                         callback();
//                     }
//                 );
//             },
//             // Get all practices
//             (callback) => {
//                 rest.post('/v1/practice_content/get_practices',
//                     {
//                         filter: new FilterParams(),
//                         paging: new PagingParams()
//                     },
//                     (err, req, res, page) => {
//                         assert.isNull(err);

//                         assert.isObject(page);
//                         assert.lengthOf(page.data, 2);

//                         practice1 = page.data[0];

//                         callback();
//                     }
//                 )
//             },
//             // Create the first versioned practice
//             (callback) => {
//                 rest.post('/v1/practice_content/add_versioned_practice',
//                     {
//                         practice_id: practice1.id,
//                         versioned_practice: VERPRACTICE1
//                     },
//                     (err, req, res, practice) => {
//                         assert.isNull(err);

//                         assert.isObject(practice);
//                         assert.equal(VERPRACTICE1.id, practice.id);
//                         assert.equal(VERPRACTICE1.version_id, practice.version_id);
//                         assert.equal(VERPRACTICE1.author_id, practice.author_id);
//                         assert.equal(VERPRACTICE1.title, practice.title);
//                         assert.equal(VERPRACTICE1.category, practice.category);
//                         //assert.equal(VERPRACTICE1.create_time.getTime(), practice.create_time.getTime()); 

//                         callback();
//                     }
//                 )
//             },
//             // Create the second versioned practice
//             (callback) => {
//                 rest.post('/v1/practice_content/add_versioned_practice',
//                     {
//                         practice_id: practice1.id,
//                         versioned_practice: VERPRACTICE2
//                     },
//                     (err, req, res, practice) => {
//                         assert.isNull(err);

//                         assert.isObject(practice);
//                         assert.equal(VERPRACTICE2.id, practice.id);
//                         assert.equal(VERPRACTICE2.version_id, practice.version_id);
//                         assert.equal(VERPRACTICE2.author_id, practice.author_id);
//                         assert.equal(VERPRACTICE2.title, practice.title);
//                         assert.equal(VERPRACTICE2.category, practice.category);
//                         //assert.equal(VERPRACTICE2.create_time.getTime(), practice.create_time.getTime()); 

//                         callback();
//                     }
//                 )
//             },
//             // Get all versioned practices
//             (callback) => {
//                 rest.post('/v1/practice_content/get_versioned_practices',
//                     {
//                         filter: new FilterParams(),
//                         paging: new PagingParams()
//                     },
//                     (err, req, res, page) => {
//                         assert.isNull(err);

//                         assert.isObject(page);
//                         assert.lengthOf(page.data, 2);

//                         ver_practice1 = page.data[0];

//                         callback();
//                     }
//                 )
//             },
//             // Get practice by id and version_id
//             (callback) => {
//                 rest.post('/v1/practice_content/get_versioned_practice_by_id',
//                     {
//                         practice_id: practice1.id,
//                         version_id: ver_practice1.version_id
//                     },
//                     (err, req, res, practice) => {
//                         assert.isNull(err);

//                         assert.isObject(practice);
//                         assert.equal(ver_practice1.version_id, practice.version_id);

//                         callback();
//                     }
//                 )
//             },
//             // Delete the versioned practice
//             (callback) => {
//                 rest.post('/v1/practice_content/remove_versioned_practice',
//                     {
//                         practice_id: practice1.id,
//                         version_id: ver_practice1.version_id
//                     },
//                     (err, req, res, practice) => {
//                         assert.isNull(err);

//                         assert.isObject(practice);
//                         assert.equal(ver_practice1.id, practice.id);
//                         assert.equal(ver_practice1.version_id, practice.version_id);

//                         callback();
//                     }
//                 )
//             },
//             // Try to get deleted versioned practice
//             (callback) => {
//                 rest.post('/v1/practice_content/get_versioned_practice_by_id',
//                     {
//                         practice_id: practice1.id,
//                         version_id: ver_practice1.version_id
//                     },
//                     (err, req, res, practice) => {
//                         assert.isNull(err);

//                         assert.isEmpty(practice || null);

//                         callback();
//                     }
//                 )
//             },

//             // Create practice user
//             (callback) => {
//                 rest.post('/v1/practice_content/add_practice_user',
//                     {
//                         practice_id: practice1.id
//                     },
//                     (err, req, res, practice) => {
//                         assert.isNull(err);

//                         assert.isObject(practice);
//                         assert.equal(practice.user_count, 1);

//                         callback();
//                     }
//                 )
//             },
//             // Remove practice user
//             (callback) => {
//                 rest.post('/v1/practice_content/remove_practice_user',
//                     {
//                         practice_id: practice1.id
//                     },
//                     (err, req, res, practice) => {
//                         assert.isNull(err);

//                         assert.isObject(practice);
//                         assert.equal(practice.user_count, 0);

//                         callback();
//                     }
//                 )
//             },


//             // Delete the practice
//             (callback) => {
//                 rest.post('/v1/practice_content/delete_practice_by_id',
//                     {
//                         practice_id: practice1.id
//                     },
//                     (err, req, res, practice) => {
//                         assert.isNull(err);

//                         assert.isObject(practice);
//                         assert.equal(practice1.id, practice.id);

//                         callback();
//                     }
//                 )
//             },
//             // Try to get deleted practice
//             (callback) => {
//                 rest.post('/v1/practice_content/get_practice_by_id',
//                     {
//                         practice_id: practice1.id
//                     },
//                     (err, req, res, practice) => {
//                         assert.isNull(err);

//                         assert.isEmpty(practice || null);

//                         callback();
//                     }
//                 )
//             }
//         ], done);
//     });

// });