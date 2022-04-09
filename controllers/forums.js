const Forum = require("../models/forum");
const { cloudinary } = require("../cloudinary");

module.exports.index = async (req, res) => {
  const forums = await Forum.find({}).populate("author");
  //findbyId등은 구조상 비동기만 사용할 수 있기 때문에 async,await을 사용해 준다
  // popualte를 사용해 Forum model의 ref author를 가져옴
  res.render("forums/index", { forums });
  // console.log(forums);
  // res.render의 두번째 인수로 {abcd}를 해주면 해당 ejs에서 abcd객체 내부에 접근할 수 있다. 이렇게 접근하면 <%= abcd.title %>등으로 사용할 수 있음
};

module.exports.renderNewForum = (req, res) => {
  res.render("forums/new");
};

module.exports.createNewForum = async (req, res, next) => {
  const forum = new Forum(req.body.forum);
  forum.imgs = req.files.map((f) => ({ url: f.path, filename: f.filename }));
  // multer로 보낸 파일의 정보를 url과 filename을 포함한 배열로 만듬
  forum.author = req.user._id;
  await forum.save();
  console.log(forum);
  req.flash("success", "게시물이 작성되었습니다.");
  res.redirect(`/forums/${forum._id}`);
};

module.exports.showForum = async (req, res) => {
  const forums = await await Forum.findById(req.params.id)
    .populate({
      path: "comments",
      populate: {
        path: "author",
      },
    })
    // 찾는 글의 댓글 배열에 있는 모든 댓글을 forum.comments에 채워넣으라는 코드. commnet의 username도 추적해서 접근할 수 있어진다.
    .populate("author");
  // console.log(forums);
  // .populate부턴 댓글을 추가하기 위해서 보강한 부분임
  if (!forums) {
    req.flash("del", "게시물을 찾을 수 없습니다.");
    return res.redirect("/forums");
  }
  // 존재하지 않는 글에 접근하였을 때
  res.render("forums/show", { forums });
};

module.exports.renderEditForum = async (req, res) => {
  const forums = await Forum.findById(req.params.id);
  if (!forums) {
    req.flash("del", "게시물을 찾을 수 없습니다.");
    return res.redirect("/forums");
  }
  // 존재하지 않는 글에 접근하였을 때
  res.render("forums/edit", { forums });
};

module.exports.updateForum = async (req, res) => {
  const { id } = req.params;
  console.log(req.body);
  // const forums = await Forum.findById(id);
  // if (!forums.author.equals(req.user._id)) {
  //   req.flash("del", "권한이 없습니다.");
  //   res.redirect(`/forums/${forums._id}`);
  // } 미들웨어로 쓰기 때문에 지워줌
  // const forums = await Forum.findByIdAndUpdate(id, { ...req.body.forum });
  const forums = await Forum.findByIdAndUpdate(id, { ...req.body.forum });
  // 두번쨰 인수는 업데이트할 실제 쿼리. 안에 있는 내용을 전부 가져와야해서 ...을 사용하는듯?
  const img = req.files.map((f) => ({ url: f.path, filename: f.filename }));
  forums.imgs.push(...img); // 배열이 아닌 별개 인수로 전달
  // 기존 이미지를 덮어쓰지 않고 추가하는 기능 밖에 없음. 이미지 삭제는 따로 진행함
  await forums.save();
  if (req.body.deleteImg) {
    for (let filename of req.body.deleteImg) {
      await cloudinary.uploader.destroy(filename);
      // cloudinary의 내장 메서드로, 삭제 된 이미지가 cloudinary서버에서도 삭제되게 해줌
    }
    await forums.updateOne({
      $pull: {
        //꺼낸다
        imgs: {
          //imgs 에서
          filename: {
            // filename 중에
            $in: req.body.deleteImg,
            //delteImg 값이 있는 애들만
          },
        },
      },
    });
    console.log(forums);
  }
  // 현재 배열에서 체크박스가 체크된 이미지의 value에 해당하는 것만 지우도록 함

  req.flash("update", "게시물이 업데이트 되었습니다.");
  res.redirect(`/forums/${forums._id}`);
};

module.exports.deleteForum = async (req, res) => {
  const { id } = req.params;
  const forum = await Forum.findByIdAndDelete(id);
  req.flash("del", "게시물이 삭제되었습니다.");
  res.redirect("/forums");
};
