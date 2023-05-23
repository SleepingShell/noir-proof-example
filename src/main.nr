struct Type1 {
  val1: Field,
  val2: bool,  
}

struct Type2 {
  val1: Field,
  val2: Field,
  val3: Field,
}

fn main(x: pub Type1, y: pub Type2) {
    constrain x.val1 >= 10;
    constrain x.val2 == true;

    constrain y.val1 + y.val2 == y.val3;
}

#[test]
fn test_main() {
}